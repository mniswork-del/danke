import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { adminPool, userPool, papersPool, fallbackStore, isDbConnected } from '../db';
import { generateAdminToken, requireAdminAuth, AuthRequest } from '../auth';

export const adminRouter = Router();

// Helper: Log Admin Activity
async function logAdminAction(adminId: number, targetType: string, targetId: string, action: string, description: string, ip: string) {
  try {
    if (isDbConnected() && adminPool) {
      await adminPool.query(
        'INSERT INTO admin_activity_logs (admin_id, target_type, target_id, action, description, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, targetType, targetId, action, description, ip]
      );
    } else {
      fallbackStore.adminDb.admin_activity_logs.unshift({
        id: fallbackStore.adminDb.admin_activity_logs.length + 1,
        admin_id: adminId,
        target_type: targetType,
        target_id: targetId,
        action,
        description,
        ip_address: ip,
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error('Failed to log admin action:', e);
  }
}

// POST /api/admin/login & /api/admin/login.php
adminRouter.post(['/login', '/login.php'], async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Please enter admin username and password.' });
    }

    const cleanUsername = String(username).trim();

    if (isDbConnected() && adminPool) {
      const [rows]: any = await adminPool.query('SELECT * FROM admin_users WHERE username = ?', [cleanUsername]);

      if (rows.length === 0) {
        await adminPool.query('INSERT INTO admin_login_attempts (username, ip_address, success) VALUES (?, ?, 0)', [cleanUsername, ip]);
        return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
      }

      const admin = rows[0];
      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        await adminPool.query('INSERT INTO admin_login_attempts (username, ip_address, success) VALUES (?, ?, 0)', [cleanUsername, ip]);
        return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({ success: false, error: 'This admin account is suspended.' });
      }

      await adminPool.query('INSERT INTO admin_login_attempts (username, ip_address, success) VALUES (?, ?, 1)', [cleanUsername, ip]);
      await adminPool.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id]);

      await logAdminAction(admin.id, 'system', String(admin.id), 'LOGIN', `Admin ${admin.username} logged in`, ip);

      const token = generateAdminToken({ adminId: admin.id, username: admin.username, role: admin.role });
      res.cookie('admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.json({
        success: true,
        message: 'Admin authentication successful.',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
      });
    } else {
      const admin = fallbackStore.adminDb.admin_users.find(a => a.username.toLowerCase() === cleanUsername.toLowerCase());
      if (!admin) {
        return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
      }

      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({ success: false, error: 'This admin account is suspended.' });
      }

      admin.last_login_at = new Date().toISOString();
      await logAdminAction(admin.id, 'system', String(admin.id), 'LOGIN', `Admin ${admin.username} logged in`, ip);

      const token = generateAdminToken({ adminId: admin.id, username: admin.username, role: admin.role });
      res.cookie('admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.json({
        success: true,
        message: 'Admin authentication successful.',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
      });
    }
  } catch (err: any) {
    console.error('Admin Login Error:', err);
    return res.status(500).json({ success: false, error: 'Admin login failed.' });
  }
});

// POST /api/admin/logout & /api/admin/logout.php
adminRouter.post(['/logout', '/logout.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  if (req.admin) {
    await logAdminAction(req.admin.id, 'system', String(req.admin.id), 'LOGOUT', `Admin ${req.admin.username} logged out`, ip);
  }
  res.clearCookie('admin_token');
  return res.json({ success: true, message: 'Logged out of admin panel.' });
});

// GET /api/admin/me & /api/admin/me.php
adminRouter.get(['/me', '/me.php'], requireAdminAuth, (req: AuthRequest, res: Response) => {
  return res.json({ success: true, admin: req.admin });
});

// GET /api/admin/dashboard & /api/admin/dashboard.php
adminRouter.get(['/dashboard', '/dashboard.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected() && userPool && papersPool) {
      // 1. User stats from u913393473_users
      const [userStats]: any = await userPool.query(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
        FROM users
      `);

      // 2. Paper stats from u913393473_papers
      const [paperStats]: any = await papersPool.query(`
        SELECT 
          COUNT(*) as total_papers,
          SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as live_papers,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_papers,
          SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) as pending_papers,
          SUM(CASE WHEN DATE(uploaded_at) = CURDATE() THEN 1 ELSE 0 END) as today_uploads,
          SUM(CASE WHEN YEARWEEK(uploaded_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as week_uploads,
          SUM(CASE WHEN YEAR(uploaded_at) = YEAR(CURDATE()) AND MONTH(uploaded_at) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as month_uploads
        FROM paper_files
      `);

      // 3. Recent uploads from u913393473_papers
      const [recentRows]: any = await papersPool.query(`
        SELECT 
          pf.*, 
          pt.name as paper_type_name, 
          pt.code as paper_type_code,
          s.name as subject_name, 
          py.year as exam_year
        FROM paper_files pf
        LEFT JOIN paper_types pt ON pf.paper_type_id = pt.id
        LEFT JOIN subjects s ON pf.subject_id = s.id
        LEFT JOIN paper_years py ON pf.paper_year_id = py.id
        ORDER BY pf.uploaded_at DESC
        LIMIT 10
      `);

      return res.json({
        success: true,
        stats: {
          totalUsers: Number(userStats[0]?.total_users || 0),
          activeUsers: Number(userStats[0]?.active_users || 0),
          suspendedUsers: Number(userStats[0]?.suspended_users || 0),
          totalPapers: Number(paperStats[0]?.total_papers || 0),
          livePapers: Number(paperStats[0]?.live_papers || 0),
          rejectedPapers: Number(paperStats[0]?.rejected_papers || 0),
          pendingPapers: Number(paperStats[0]?.pending_papers || 0),
          todayUploads: Number(paperStats[0]?.today_uploads || 0),
          weekUploads: Number(paperStats[0]?.week_uploads || 0),
          monthUploads: Number(paperStats[0]?.month_uploads || 0),
        },
        recentUploads: recentRows,
      });
    } else {
      // In-memory fallback
      const totalUsers = fallbackStore.userDb.users.length;
      const activeUsers = fallbackStore.userDb.users.filter(u => u.status === 'active').length;
      const suspendedUsers = fallbackStore.userDb.users.filter(u => u.status === 'suspended').length;

      const totalPapers = fallbackStore.papersDb.paper_files.length;
      const livePapers = fallbackStore.papersDb.paper_files.filter(p => p.status === 'live').length;
      const rejectedPapers = fallbackStore.papersDb.paper_files.filter(p => p.status === 'rejected').length;
      const pendingPapers = fallbackStore.papersDb.paper_files.filter(p => p.status === 'pending_review').length;

      const recentUploads = fallbackStore.papersDb.paper_files.slice(0, 10);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          totalPapers,
          livePapers,
          rejectedPapers,
          pendingPapers,
          todayUploads: livePapers,
          weekUploads: totalPapers,
          monthUploads: totalPapers,
        },
        recentUploads,
      });
    }
  } catch (err: any) {
    console.error('Admin Dashboard Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load dashboard metrics.' });
  }
});

// GET /api/admin/users & /api/admin/users.php
adminRouter.get(['/users', '/users.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected() && userPool && papersPool) {
      const [users]: any = await userPool.query(`
        SELECT 
          u.id, 
          u.phone_number, 
          u.status, 
          u.profile_completed, 
          u.last_login_at, 
          u.created_at,
          p.name,
          p.city,
          p.profession,
          p.email,
          p.age
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        ORDER BY u.created_at DESC
      `);

      // Count papers for each user from u913393473_papers
      const [paperCounts]: any = await papersPool.query(`
        SELECT 
          user_id, 
          COUNT(*) as total_uploaded,
          SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as live_count,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
        FROM paper_files
        GROUP BY user_id
      `);

      const countMap = new Map();
      for (const pc of paperCounts) {
        countMap.set(pc.user_id, {
          total: pc.total_uploaded,
          live: pc.live_count,
          rejected: pc.rejected_count,
        });
      }

      const result = users.map((u: any) => {
        const stats = countMap.get(u.id) || { total: 0, live: 0, rejected: 0 };
        return {
          id: u.id,
          mobile: u.phone_number,
          name: u.name || (u.profile_completed ? 'Student User' : 'Incomplete Profile'),
          city: u.city || '—',
          profession: u.profession || 'Student',
          email: u.email || '—',
          age: u.age,
          profileCompleted: Boolean(u.profile_completed),
          status: u.status,
          uploadedCount: stats.total,
          approvedCount: stats.live,
          rejectedCount: stats.rejected,
          joinedDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2025-01-01',
          lastLoginAt: u.last_login_at,
        };
      });

      return res.json({ success: true, users: result });
    } else {
      const result = fallbackStore.userDb.users.map(u => {
        const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === u.id);
        const userPapers = fallbackStore.papersDb.paper_files.filter(p => p.user_id === u.id);
        return {
          id: u.id,
          mobile: u.phone_number,
          name: profile?.name || (u.profile_completed ? 'Student User' : 'Incomplete Profile'),
          city: profile?.city || '—',
          profession: profile?.profession || 'Student',
          email: profile?.email || '—',
          age: profile?.age,
          profileCompleted: Boolean(u.profile_completed),
          status: u.status,
          uploadedCount: userPapers.length,
          approvedCount: userPapers.filter(p => p.status === 'live').length,
          rejectedCount: userPapers.filter(p => p.status === 'rejected').length,
          joinedDate: u.created_at ? u.created_at.split('T')[0] : '2025-01-01',
          lastLoginAt: u.last_login_at,
        };
      });

      return res.json({ success: true, users: result });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users list.' });
  }
});

// GET /api/admin/users/:id/papers (User-wise paper view)
adminRouter.get('/users/:id/papers', requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = Number(req.params.id);

    if (isDbConnected() && papersPool) {
      const query = `
        SELECT 
          pf.*, 
          pt.name as paper_type_name, 
          pt.code as paper_type_code,
          s.name as subject_name, 
          py.year as exam_year
        FROM paper_files pf
        LEFT JOIN paper_types pt ON pf.paper_type_id = pt.id
        LEFT JOIN subjects s ON pf.subject_id = s.id
        LEFT JOIN paper_years py ON pf.paper_year_id = py.id
        WHERE pf.user_id = ?
        ORDER BY pf.uploaded_at DESC
      `;
      const [rows]: any = await papersPool.query(query, [targetUserId]);

      const formatted = rows.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        type: r.paper_type_name,
        subject: r.subject_name,
        year: r.exam_year,
        fileName: r.original_filename,
        fileType: r.file_extension,
        fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
        fileUrl: r.file_path,
        uploadedAt: r.uploaded_at,
        status: r.status,
        rejectionReason: r.rejection_reason,
        reviewedAt: r.reviewed_at,
      }));

      return res.json({ success: true, papers: formatted });
    } else {
      const list = fallbackStore.papersDb.paper_files.filter(p => p.user_id === targetUserId);
      const formatted = list.map(r => {
        const pt = fallbackStore.papersDb.paper_types.find(t => t.id === r.paper_type_id);
        const s = fallbackStore.papersDb.subjects.find(sub => sub.id === r.subject_id);
        const y = fallbackStore.papersDb.paper_years.find(yr => yr.id === r.paper_year_id);
        return {
          id: String(r.id),
          title: r.title,
          type: pt?.name || 'PYQ',
          subject: s?.name || 'Subject',
          year: y?.year || 2025,
          fileName: r.original_filename,
          fileType: r.file_extension,
          fileSize: `${(r.file_size / (1024 * 1024)).toFixed(1)} MB`,
          fileUrl: r.file_path,
          uploadedAt: r.uploaded_at,
          status: r.status,
          rejectionReason: r.rejection_reason,
          reviewedAt: r.reviewed_at,
        };
      });

      return res.json({ success: true, papers: formatted });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user papers.' });
  }
});

// GET /api/admin/papers & /api/admin/papers.php
adminRouter.get(['/papers', '/papers.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { date_filter, status, subject_id, year_id, type_id, search, start_date, end_date } = req.query;

    if (isDbConnected() && papersPool) {
      let query = `
        SELECT 
          pf.*, 
          pt.name as paper_type_name, 
          pt.code as paper_type_code,
          s.name as subject_name, 
          py.year as exam_year
        FROM paper_files pf
        LEFT JOIN paper_types pt ON pf.paper_type_id = pt.id
        LEFT JOIN subjects s ON pf.subject_id = s.id
        LEFT JOIN paper_years py ON pf.paper_year_id = py.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status && status !== 'ALL') {
        query += ' AND pf.status = ?';
        params.push(status);
      }
      if (subject_id) {
        query += ' AND pf.subject_id = ?';
        params.push(Number(subject_id));
      }
      if (year_id) {
        query += ' AND pf.paper_year_id = ?';
        params.push(Number(year_id));
      }
      if (type_id) {
        query += ' AND pf.paper_type_id = ?';
        params.push(Number(type_id));
      }
      if (search) {
        query += ' AND (pf.title LIKE ? OR pf.user_phone LIKE ? OR s.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Date Filtering
      if (date_filter === 'today') {
        query += ' AND DATE(pf.uploaded_at) = CURDATE()';
      } else if (date_filter === 'yesterday') {
        query += ' AND DATE(pf.uploaded_at) = SUBDATE(CURDATE(), 1)';
      } else if (date_filter === 'this_week') {
        query += ' AND YEARWEEK(pf.uploaded_at, 1) = YEARWEEK(CURDATE(), 1)';
      } else if (date_filter === 'last_7_days' || date_filter === 'week') {
        query += ' AND pf.uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (date_filter === 'this_month') {
        query += ' AND YEAR(pf.uploaded_at) = YEAR(CURDATE()) AND MONTH(pf.uploaded_at) = MONTH(CURDATE())';
      } else if (date_filter === 'last_30_days' || date_filter === 'month') {
        query += ' AND pf.uploaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (start_date && end_date) {
        query += ' AND DATE(pf.uploaded_at) BETWEEN ? AND ?';
        params.push(start_date, end_date);
      }

      query += ' ORDER BY pf.uploaded_at DESC';

      const [rows]: any = await papersPool.query(query, params);

      return res.json({ success: true, papers: rows });
    } else {
      let list = [...fallbackStore.papersDb.paper_files];

      if (status && status !== 'ALL') {
        list = list.filter(p => p.status === status);
      }
      if (subject_id) {
        list = list.filter(p => p.subject_id === Number(subject_id));
      }
      if (year_id) {
        list = list.filter(p => p.paper_year_id === Number(year_id));
      }
      if (type_id) {
        list = list.filter(p => p.paper_type_id === Number(type_id));
      }
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || p.user_phone.includes(q));
      }

      return res.json({ success: true, papers: list });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch admin papers.' });
  }
});

// POST /api/admin/papers/:id/reject & /api/admin/reject-paper & /api/admin/reject-paper.php
adminRouter.post(['/papers/:id/reject', '/reject-paper', '/reject-paper.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  try {
    const paperId = Number(req.params.id || req.body.paper_id);
    const { rejection_reason, reason: rawReason } = req.body;
    const admin = req.admin!;

    const reason = String(rejection_reason || rawReason || 'Paper violates upload guidelines or lacks clarity').trim();

    if (isDbConnected() && papersPool) {
      await papersPool.query(
        `UPDATE paper_files 
         SET status = 'rejected', rejection_reason = ?, reviewed_by_admin_id = ?, reviewed_at = NOW() 
         WHERE id = ?`,
        [reason, admin.id, paperId]
      );

      await logAdminAction(admin.id, 'paper', String(paperId), 'REJECT_PAPER', `Rejected paper #${paperId}: ${reason}`, ip);

      return res.json({ success: true, message: 'Paper rejected successfully.' });
    } else {
      const paper = fallbackStore.papersDb.paper_files.find(p => p.id === paperId);
      if (paper) {
        paper.status = 'rejected';
        paper.rejection_reason = reason;
        paper.reviewed_by_admin_id = admin.id;
        paper.reviewed_at = new Date().toISOString();
      }

      await logAdminAction(admin.id, 'paper', String(paperId), 'REJECT_PAPER', `Rejected paper #${paperId}: ${reason}`, ip);
      return res.json({ success: true, message: 'Paper rejected successfully.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to reject paper.' });
  }
});

// POST /api/admin/users/:id/suspend & /api/admin/suspend-user & /api/admin/suspend-user.php
adminRouter.post(['/users/:id/suspend', '/suspend-user', '/suspend-user.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  try {
    const targetUserId = Number(req.params.id || req.body.user_id);
    const admin = req.admin!;

    if (isDbConnected() && userPool) {
      await userPool.query("UPDATE users SET status = 'suspended' WHERE id = ?", [targetUserId]);
      await logAdminAction(admin.id, 'user', String(targetUserId), 'SUSPEND_USER', `Suspended user account #${targetUserId}`, ip);
      return res.json({ success: true, message: 'User account has been suspended.' });
    } else {
      const user = fallbackStore.userDb.users.find(u => u.id === targetUserId);
      if (user) {
        user.status = 'suspended';
      }
      await logAdminAction(admin.id, 'user', String(targetUserId), 'SUSPEND_USER', `Suspended user account #${targetUserId}`, ip);
      return res.json({ success: true, message: 'User account has been suspended.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to suspend user.' });
  }
});

// POST /api/admin/users/:id/activate & /api/admin/activate-user & /api/admin/activate-user.php
adminRouter.post(['/users/:id/activate', '/activate-user', '/activate-user.php'], requireAdminAuth, async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  try {
    const targetUserId = Number(req.params.id || req.body.user_id);
    const admin = req.admin!;

    if (isDbConnected() && userPool) {
      await userPool.query("UPDATE users SET status = 'active' WHERE id = ?", [targetUserId]);
      await logAdminAction(admin.id, 'user', String(targetUserId), 'ACTIVATE_USER', `Reactivated user account #${targetUserId}`, ip);
      return res.json({ success: true, message: 'User account reactivated successfully.' });
    } else {
      const user = fallbackStore.userDb.users.find(u => u.id === targetUserId);
      if (user) {
        user.status = 'active';
      }
      await logAdminAction(admin.id, 'user', String(targetUserId), 'ACTIVATE_USER', `Reactivated user account #${targetUserId}`, ip);
      return res.json({ success: true, message: 'User account reactivated successfully.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to reactivate user.' });
  }
});

// GET /api/admin/reports
adminRouter.get('/reports', requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected() && papersPool) {
      const [dateSummary]: any = await papersPool.query(`
        SELECT 
          SUM(CASE WHEN DATE(uploaded_at) = CURDATE() THEN 1 ELSE 0 END) as today_count,
          SUM(CASE WHEN YEARWEEK(uploaded_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as week_count,
          SUM(CASE WHEN YEAR(uploaded_at) = YEAR(CURDATE()) AND MONTH(uploaded_at) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as month_count
        FROM paper_files
      `);

      const [userReports]: any = await papersPool.query(`
        SELECT 
          user_id,
          user_phone,
          COUNT(*) as total_papers,
          SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as live_papers,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_papers
        FROM paper_files
        GROUP BY user_id, user_phone
        ORDER BY total_papers DESC
        LIMIT 50
      `);

      return res.json({
        success: true,
        summary: dateSummary[0],
        userReports,
      });
    } else {
      const total = fallbackStore.papersDb.paper_files.length;
      return res.json({
        success: true,
        summary: {
          today_count: total,
          week_count: total,
          month_count: total,
        },
        userReports: [],
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to generate reports.' });
  }
});

// GET /api/admin/logs
adminRouter.get('/logs', requireAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected() && adminPool) {
      const [logs]: any = await adminPool.query('SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100');
      return res.json({ success: true, logs });
    } else {
      return res.json({ success: true, logs: fallbackStore.adminDb.admin_activity_logs });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch admin logs.' });
  }
});
