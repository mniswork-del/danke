import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { userPool, adminPool, fallbackStore, isDbConnected } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'universitytree_secure_jwt_secret_key_2026_hostinger';

export interface AuthenticatedUserPayload {
  userId: number;
  phone: string;
  role: string;
}

export interface AuthenticatedAdminPayload {
  adminId: number;
  username: string;
  role: 'super_admin' | 'admin' | 'moderator';
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    phone_number: string;
    status: 'active' | 'suspended';
    profile_completed: number;
  };
  admin?: {
    id: number;
    username: string;
    role: 'super_admin' | 'admin' | 'moderator';
    status: 'active' | 'suspended';
  };
}

export function generateUserToken(payload: AuthenticatedUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function generateAdminToken(payload: AuthenticatedAdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware: Require Authenticated User
export async function requireUserAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
    }

    if (isDbConnected() && userPool) {
      const [rows]: any = await userPool.query(
        'SELECT id, phone_number, status, profile_completed FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'User account not found.' });
      }

      const user = rows[0];
      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
      }

      req.user = user;
      next();
    } else {
      // Fallback in-memory
      const user = fallbackStore.userDb.users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'User account not found.' });
      }
      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
      }
      req.user = {
        id: user.id,
        phone_number: user.phone_number,
        status: user.status,
        profile_completed: user.profile_completed,
      };
      next();
    }
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in.' });
  }
}

// Middleware: Optional User Auth (for public endpoints that can enrich data if user is logged in)
export async function optionalUserAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }

    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    if (decoded && decoded.userId) {
      if (isDbConnected() && userPool) {
        const [rows]: any = await userPool.query(
          'SELECT id, phone_number, status, profile_completed FROM users WHERE id = ?',
          [decoded.userId]
        );
        if (rows.length > 0 && rows[0].status === 'active') {
          req.user = rows[0];
        }
      } else {
        const user = fallbackStore.userDb.users.find(u => u.id === decoded.userId);
        if (user && user.status === 'active') {
          req.user = {
            id: user.id,
            phone_number: user.phone_number,
            status: user.status,
            profile_completed: user.profile_completed,
          };
        }
      }
    }
    next();
  } catch {
    next();
  }
}

// Middleware: Require Admin Auth
export async function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Admin credentials required. Access restricted.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedAdminPayload;
    if (!decoded || !decoded.adminId) {
      return res.status(401).json({ success: false, error: 'Invalid admin token.' });
    }

    if (isDbConnected() && adminPool) {
      const [rows]: any = await adminPool.query(
        'SELECT id, username, role, status FROM admin_users WHERE id = ?',
        [decoded.adminId]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Admin user not found.' });
      }

      const admin = rows[0];
      if (admin.status !== 'active') {
        return res.status(403).json({ success: false, error: 'This admin account is suspended.' });
      }

      req.admin = admin;
      next();
    } else {
      const admin = fallbackStore.adminDb.admin_users.find(a => a.id === decoded.adminId);
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Admin user not found.' });
      }
      if (admin.status !== 'active') {
        return res.status(403).json({ success: false, error: 'This admin account is suspended.' });
      }
      req.admin = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        status: admin.status,
      };
      next();
    }
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Admin session expired or invalid.' });
  }
}
