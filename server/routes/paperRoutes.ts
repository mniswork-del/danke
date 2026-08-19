import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { papersPool, fallbackStore, isDbConnected } from '../db';
import { requireUserAuth, optionalUserAuth, AuthRequest } from '../auth';

export const paperRouter = Router();

// Base upload path (configurable via env)
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'papers');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const year = req.body.year || new Date().getFullYear().toString();
    const targetDir = path.join(UPLOAD_BASE_DIR, String(year));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `paper_${uniqueSuffix}${ext}`);
  },
});

// File validation filter
const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.ppt', '.pptx'];
const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Invalid file format '${ext}'. Allowed types: PDF, JPG, PNG, WEBP, DOC, DOCX, PPT, PPTX.`));
    }
    cb(null, true);
  },
});

// GET /api/paper-types
paperRouter.get('/paper-types', async (req, res) => {
  try {
    if (isDbConnected() && papersPool) {
      const [rows] = await papersPool.query('SELECT * FROM paper_types ORDER BY id ASC');
      return res.json({ success: true, types: rows });
    }
    return res.json({ success: true, types: fallbackStore.papersDb.paper_types });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch paper types.' });
  }
});

// GET /api/subjects
paperRouter.get('/subjects', async (req, res) => {
  try {
    if (isDbConnected() && papersPool) {
      const [rows] = await papersPool.query('SELECT * FROM subjects ORDER BY name ASC');
      return res.json({ success: true, subjects: rows });
    }
    return res.json({ success: true, subjects: fallbackStore.papersDb.subjects });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch subjects.' });
  }
});

// GET /api/years
paperRouter.get('/years', async (req, res) => {
  try {
    if (isDbConnected() && papersPool) {
      const [rows] = await papersPool.query('SELECT * FROM paper_years ORDER BY year DESC');
      return res.json({ success: true, years: rows });
    }
    return res.json({ success: true, years: fallbackStore.papersDb.paper_years });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch academic years.' });
  }
});

// GET /api/papers (Public live papers with filters)
paperRouter.get('/papers', optionalUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search, type_id, subject_id, year_id, category, sort } = req.query;

    if (isDbConnected() && papersPool) {
      let query = `
        SELECT 
          pf.*, 
          pt.name as paper_type_name, 
          pt.code as paper_type_code,
          s.name as subject_name, 
          s.category as subject_category,
          py.year as exam_year
        FROM paper_files pf
        LEFT JOIN paper_types pt ON pf.paper_type_id = pt.id
        LEFT JOIN subjects s ON pf.subject_id = s.id
        LEFT JOIN paper_years py ON pf.paper_year_id = py.id
        WHERE pf.status = 'live'
      `;
      const params: any[] = [];

      if (type_id) {
        query += ' AND pf.paper_type_id = ?';
        params.push(Number(type_id));
      }
      if (subject_id) {
        query += ' AND pf.subject_id = ?';
        params.push(Number(subject_id));
      }
      if (year_id) {
        query += ' AND pf.paper_year_id = ?';
        params.push(Number(year_id));
      }
      if (search) {
        query += ' AND (pf.title LIKE ? OR s.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY pf.uploaded_at DESC';

      const [rows]: any = await papersPool.query(query, params);

      const formatted = rows.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        type: (r.paper_type_code || 'pyq') as any,
        category: (r.subject_category?.toLowerCase() || 'college') as any,
        institution: 'University Tree Academic Repository',
        subject: r.subject_name || 'Academic Course',
        year: r.exam_year || 2025,
        course: r.subject_name || 'Degree Course',
        examType: 'End-Sem',
        language: 'English',
        uploaderId: String(r.user_id),
        uploaderName: `User ${r.user_phone ? r.user_phone.slice(-4) : 'Verified'}`,
        uploaderMobile: r.user_phone,
        uploadDate: r.uploaded_at ? new Date(r.uploaded_at).toISOString().split('T')[0] : '2025-01-01',
        fileUrl: r.file_path,
        fileName: r.original_filename,
        fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
        pageCount: 4,
        hasSolutions: r.paper_type_code === 'answer_key',
        tags: [r.subject_name, String(r.exam_year), r.paper_type_name].filter(Boolean),
        viewsCount: r.views_count || 0,
        downloadsCount: r.downloads_count || 0,
        status: 'APPROVED',
        rewardAmount: 5,
      }));

      return res.json({ success: true, papers: formatted });
    } else {
      // In-memory fallback
      let list = fallbackStore.papersDb.paper_files.filter(p => p.status === 'live');

      if (type_id) {
        list = list.filter(p => p.paper_type_id === Number(type_id));
      }
      if (subject_id) {
        list = list.filter(p => p.subject_id === Number(subject_id));
      }
      if (year_id) {
        list = list.filter(p => p.paper_year_id === Number(year_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q));
      }

      const formatted = list.map(r => {
        const pt = fallbackStore.papersDb.paper_types.find(t => t.id === r.paper_type_id);
        const s = fallbackStore.papersDb.subjects.find(sub => sub.id === r.subject_id);
        const y = fallbackStore.papersDb.paper_years.find(yr => yr.id === r.paper_year_id);
        return {
          id: String(r.id),
          title: r.title,
          type: (pt?.code || 'pyq') as any,
          category: (s?.category?.toLowerCase() || 'college') as any,
          institution: 'University Tree Academic Repository',
          subject: s?.name || 'Academic Course',
          year: y?.year || 2025,
          course: s?.name || 'Degree Course',
          examType: 'End-Sem' as const,
          language: 'English' as const,
          uploaderId: String(r.user_id),
          uploaderName: `User ${r.user_phone ? r.user_phone.slice(-4) : 'Verified'}`,
          uploaderMobile: r.user_phone,
          uploadDate: r.uploaded_at ? r.uploaded_at.split('T')[0] : '2025-01-01',
          fileUrl: r.file_path,
          fileName: r.original_filename,
          fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
          pageCount: 4,
          hasSolutions: pt?.code === 'answer_key',
          tags: [s?.name, String(y?.year), pt?.name].filter(Boolean) as string[],
          viewsCount: r.views_count || 0,
          downloadsCount: r.downloads_count || 0,
          status: 'APPROVED' as any,
          rewardAmount: 5,
        };
      });

      return res.json({ success: true, papers: formatted });
    }
  } catch (err: any) {
    console.error('Papers Fetch Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load papers.' });
  }
});

// GET /api/user/papers (Authenticated user's uploaded papers)
paperRouter.get('/user/papers', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isDbConnected() && papersPool) {
      const query = `
        SELECT 
          pf.*, 
          pt.name as paper_type_name, 
          pt.code as paper_type_code,
          s.name as subject_name, 
          s.category as subject_category,
          py.year as exam_year
        FROM paper_files pf
        LEFT JOIN paper_types pt ON pf.paper_type_id = pt.id
        LEFT JOIN subjects s ON pf.subject_id = s.id
        LEFT JOIN paper_years py ON pf.paper_year_id = py.id
        WHERE pf.user_id = ?
        ORDER BY pf.uploaded_at DESC
      `;
      const [rows]: any = await papersPool.query(query, [userId]);

      const formatted = rows.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        type: (r.paper_type_code || 'pyq') as any,
        category: (r.subject_category?.toLowerCase() || 'college') as any,
        institution: 'University Tree Academic Repository',
        subject: r.subject_name || 'Academic Course',
        year: r.exam_year || 2025,
        course: r.subject_name || 'Course',
        examType: 'End-Sem',
        language: 'English',
        uploaderId: String(r.user_id),
        uploaderName: 'Me',
        uploaderMobile: r.user_phone,
        uploadDate: r.uploaded_at ? new Date(r.uploaded_at).toISOString().split('T')[0] : '2025-01-01',
        fileUrl: r.file_path,
        fileName: r.original_filename,
        fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
        pageCount: 4,
        hasSolutions: r.paper_type_code === 'answer_key',
        tags: [r.subject_name, String(r.exam_year), r.paper_type_name].filter(Boolean),
        viewsCount: r.views_count || 0,
        downloadsCount: r.downloads_count || 0,
        status: r.status === 'live' ? 'APPROVED' : r.status === 'rejected' ? 'REJECTED' : 'PENDING_REVIEW',
        rejectionReason: r.rejection_reason || undefined,
        rewardAmount: 5,
      }));

      return res.json({ success: true, papers: formatted });
    } else {
      const list = fallbackStore.papersDb.paper_files.filter(p => p.user_id === userId);
      const formatted = list.map(r => {
        const pt = fallbackStore.papersDb.paper_types.find(t => t.id === r.paper_type_id);
        const s = fallbackStore.papersDb.subjects.find(sub => sub.id === r.subject_id);
        const y = fallbackStore.papersDb.paper_years.find(yr => yr.id === r.paper_year_id);
        return {
          id: String(r.id),
          title: r.title,
          type: (pt?.code || 'pyq') as any,
          category: (s?.category?.toLowerCase() || 'college') as any,
          institution: 'University Tree Academic Repository',
          subject: s?.name || 'Academic Course',
          year: y?.year || 2025,
          course: s?.name || 'Course',
          examType: 'End-Sem' as const,
          language: 'English' as const,
          uploaderId: String(r.user_id),
          uploaderName: 'Me',
          uploaderMobile: r.user_phone,
          uploadDate: r.uploaded_at ? r.uploaded_at.split('T')[0] : '2025-01-01',
          fileUrl: r.file_path,
          fileName: r.original_filename,
          fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
          pageCount: 4,
          hasSolutions: pt?.code === 'answer_key',
          tags: [s?.name, String(y?.year), pt?.name].filter(Boolean) as string[],
          viewsCount: r.views_count || 0,
          downloadsCount: r.downloads_count || 0,
          status: (r.status === 'live' ? 'APPROVED' : r.status === 'rejected' ? 'REJECTED' : 'PENDING_REVIEW') as any,
          rejectionReason: r.rejection_reason || undefined,
          rewardAmount: 5,
        };
      });

      return res.json({ success: true, papers: formatted });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to load your uploaded papers.' });
  }
});

// POST /api/papers/upload (Multipart upload with file and metadata)
paperRouter.post('/upload', requireUserAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // 1. Verify User status is active
    if (user.status !== 'active') {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(403).json({ success: false, error: 'Your account is suspended. Uploads are blocked.' });
    }

    // 2. Verify Profile is completed (profile_completed = 1)
    if (!user.profile_completed) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        error: 'Please complete your profile before uploading a paper.',
        requiresProfileCompletion: true,
      });
    }

    // 3. Verify file presence
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please choose a document or paper file to upload.' });
    }

    // 4. Verify required metadata fields
    const { title, paper_type_id, subject_id, paper_year_id } = req.body;
    if (!title || !String(title).trim()) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, error: 'Please enter a paper title.' });
    }
    if (!paper_type_id) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, error: 'Please select a paper type.' });
    }
    if (!subject_id) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, error: 'Please select a subject.' });
    }
    if (!paper_year_id) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, error: 'Please select a year.' });
    }

    // Calculate file hash (SHA-256)
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const storedRelativePath = `/uploads/papers/${req.body.year || new Date().getFullYear()}/${req.file.filename}`;

    if (isDbConnected() && papersPool) {
      // Check for exact duplicate file hash in live papers
      const [dupes]: any = await papersPool.query(
        'SELECT id, title FROM paper_files WHERE file_hash = ? AND status = "live"',
        [fileHash]
      );
      if (dupes.length > 0) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          success: false,
          error: `This exact file is already live in the repository under: "${dupes[0].title}".`,
        });
      }

      // Insert paper file record
      const [insertResult]: any = await papersPool.query(
        `INSERT INTO paper_files 
         (user_id, user_phone, paper_type_id, subject_id, paper_year_id, title, original_filename, stored_filename, file_path, file_extension, mime_type, file_size, file_hash, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'live')`,
        [
          user.id,
          user.phone_number,
          Number(paper_type_id),
          Number(subject_id),
          Number(paper_year_id),
          String(title).trim(),
          req.file.originalname,
          req.file.filename,
          storedRelativePath,
          ext,
          req.file.mimetype,
          req.file.size,
          fileHash,
        ]
      );

      const paperId = insertResult.insertId;

      // Log paper activity
      await papersPool.query(
        'INSERT INTO paper_activity_logs (paper_id, user_id, action, details) VALUES (?, ?, ?, ?)',
        [paperId, user.id, 'UPLOAD', `Uploaded paper: ${title}`]
      );

      return res.status(201).json({
        success: true,
        message: 'Paper uploaded successfully and is now live!',
        paper: {
          id: String(paperId),
          title: String(title).trim(),
          file_path: storedRelativePath,
          original_filename: req.file.originalname,
          status: 'live',
        },
      });
    } else {
      // Fallback in-memory
      const existingDupe = fallbackStore.papersDb.paper_files.find(p => p.file_hash === fileHash && p.status === 'live');
      if (existingDupe) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          success: false,
          error: `This exact file is already live under: "${existingDupe.title}".`,
        });
      }

      const newId = fallbackStore.papersDb.paper_files.length + 1;
      const now = new Date().toISOString();
      const newPaper = {
        id: newId,
        user_id: user.id,
        user_phone: user.phone_number,
        paper_type_id: Number(paper_type_id),
        subject_id: Number(subject_id),
        paper_year_id: Number(paper_year_id),
        title: String(title).trim(),
        original_filename: req.file.originalname,
        stored_filename: req.file.filename,
        file_path: storedRelativePath,
        file_extension: ext,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        file_hash: fileHash,
        status: 'live' as const,
        rejection_reason: null,
        reviewed_by_admin_id: null,
        reviewed_at: null,
        views_count: 0,
        downloads_count: 0,
        uploaded_at: now,
      };
      fallbackStore.papersDb.paper_files.unshift(newPaper);

      return res.status(201).json({
        success: true,
        message: 'Paper uploaded successfully and is now live!',
        paper: {
          id: String(newId),
          title: String(title).trim(),
          file_path: storedRelativePath,
          original_filename: req.file.originalname,
          status: 'live',
        },
      });
    }
  } catch (err: any) {
    console.error('Paper Upload Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload failed. Please try again.' });
  }
});
