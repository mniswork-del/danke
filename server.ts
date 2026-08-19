import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { initializeDatabases } from './server/db';
import { authRouter } from './server/routes/authRoutes';
import { profileRouter } from './server/routes/profileRoutes';
import { paperRouter } from './server/routes/paperRoutes';
import { adminRouter } from './server/routes/adminRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Hostinger MySQL connection pools / local data store
  await initializeDatabases();

  // Basic Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static uploads directory for papers
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'papers');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads/papers', express.static(uploadDir));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', paperRouter);

  // Vite Middleware Setup for Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 University Tree Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
