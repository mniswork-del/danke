import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userPool, fallbackStore, isDbConnected } from '../db';
import { generateUserToken, requireUserAuth, AuthRequest } from '../auth';

export const authRouter = Router();

// POST /api/auth/register & /api/auth/register.php
authRouter.post(['/register', '/register.php'], async (req: AuthRequest, res: Response) => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ success: false, error: 'Please provide phone number and password.' });
    }

    let cleanPhone = String(phone_number).trim().replace(/\D/g, '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isDbConnected() && userPool) {
      // Check if user already exists
      const [existing]: any = await userPool.query('SELECT id FROM users WHERE phone_number = ?', [cleanPhone]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: 'An account with this phone number already exists. Please log in.' });
      }

      // Insert new user
      const [result]: any = await userPool.query(
        'INSERT INTO users (phone_number, password_hash, status, profile_completed) VALUES (?, ?, ?, ?)',
        [cleanPhone, hashedPassword, 'active', 0]
      );
      const userId = result.insertId;

      // Create initial profile record
      await userPool.query(
        'INSERT INTO user_profiles (user_id, phone_number) VALUES (?, ?)',
        [userId, cleanPhone]
      );

      const token = generateUserToken({ userId, phone: cleanPhone, role: 'student' });
      res.cookie('user_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: userId,
          phone_number: cleanPhone,
          name: '',
          status: 'active',
          profile_completed: 0,
          profile: {
            name: '',
            profession: '',
            address: '',
            city: '',
            phone_number: cleanPhone,
            email: '',
            age: null,
          },
        },
      });
    } else {
      // Fallback in-memory
      const existing = fallbackStore.userDb.users.find(u => u.phone_number === cleanPhone);
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this phone number already exists. Please log in.' });
      }

      const newId = fallbackStore.userDb.users.length + 1;
      const now = new Date().toISOString();
      const newUser = {
        id: newId,
        phone_number: cleanPhone,
        password_hash: hashedPassword,
        status: 'active' as const,
        profile_completed: 0,
        last_login_at: now,
        created_at: now,
        updated_at: now,
      };
      fallbackStore.userDb.users.push(newUser);

      fallbackStore.userDb.user_profiles.push({
        id: newId,
        user_id: newId,
        name: '',
        profession: '',
        address: '',
        city: '',
        phone_number: cleanPhone,
        email: '',
        age: null,
        created_at: now,
        updated_at: now,
      });

      const token = generateUserToken({ userId: newId, phone: cleanPhone, role: 'student' });
      res.cookie('user_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: newId,
          phone_number: cleanPhone,
          name: '',
          status: 'active',
          profile_completed: 0,
          profile: {
            name: '',
            profession: '',
            address: '',
            city: '',
            phone_number: cleanPhone,
            email: '',
            age: null,
          },
        },
      });
    }
  } catch (err: any) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again later.' });
  }
});

// POST /api/auth/login & /api/auth/login.php
authRouter.post(['/login', '/login.php'], async (req: AuthRequest, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') as string;
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ success: false, error: 'Please enter both phone number and password.' });
    }

    let cleanPhone = String(phone_number).trim().replace(/\D/g, '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (isDbConnected() && userPool) {
      const [rows]: any = await userPool.query('SELECT * FROM users WHERE phone_number = ?', [cleanPhone]);

      if (rows.length === 0) {
        // Record failed attempt
        await userPool.query('INSERT INTO login_attempts (phone_number, ip_address, success) VALUES (?, ?, 0)', [cleanPhone, ip]);
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      const user = rows[0];

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        await userPool.query('INSERT INTO login_attempts (phone_number, ip_address, success) VALUES (?, ?, 0)', [cleanPhone, ip]);
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      // Check account status
      if (user.status !== 'active') {
        await userPool.query('INSERT INTO login_attempts (phone_number, ip_address, success) VALUES (?, ?, 0)', [cleanPhone, ip]);
        return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
      }

      // Record successful login
      await userPool.query('INSERT INTO login_attempts (phone_number, ip_address, success) VALUES (?, ?, 1)', [cleanPhone, ip]);
      await userPool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      // Fetch profile
      const [profiles]: any = await userPool.query('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
      const profile = profiles[0] || {
        name: '',
        profession: '',
        address: '',
        city: '',
        phone_number: user.phone_number,
        email: '',
        age: null,
      };

      const token = generateUserToken({ userId: user.id, phone: user.phone_number, role: 'student' });
      res.cookie('user_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          name: profile.name || '',
          status: user.status,
          profile_completed: user.profile_completed,
          last_login_at: user.last_login_at,
          profile,
        },
      });
    } else {
      // Fallback in-memory
      const user = fallbackStore.userDb.users.find(u => u.phone_number === cleanPhone);
      if (!user) {
        fallbackStore.userDb.login_attempts.push({
          id: fallbackStore.userDb.login_attempts.length + 1,
          phone_number: cleanPhone,
          ip_address: ip,
          success: 0,
          attempted_at: new Date().toISOString(),
        });
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        fallbackStore.userDb.login_attempts.push({
          id: fallbackStore.userDb.login_attempts.length + 1,
          phone_number: cleanPhone,
          ip_address: ip,
          success: 0,
          attempted_at: new Date().toISOString(),
        });
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: 'Your account has been suspended by administration.' });
      }

      user.last_login_at = new Date().toISOString();
      const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === user.id) || {
        id: user.id,
        user_id: user.id,
        name: '',
        profession: '',
        address: '',
        city: '',
        phone_number: user.phone_number,
        email: '',
        age: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const token = generateUserToken({ userId: user.id, phone: user.phone_number, role: 'student' });
      res.cookie('user_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          name: profile.name || '',
          status: user.status,
          profile_completed: user.profile_completed,
          last_login_at: user.last_login_at,
          profile,
        },
      });
    }
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: 'An error occurred during login. Please try again.' });
  }
});

// POST /api/auth/logout & /api/auth/logout.php
authRouter.post(['/logout', '/logout.php'], (req: AuthRequest, res: Response) => {
  res.clearCookie('user_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me & /api/auth/me.php
authRouter.get(['/me', '/me.php'], requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isDbConnected() && userPool) {
      const [rows]: any = await userPool.query('SELECT id, phone_number, status, profile_completed, last_login_at, created_at FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      const user = rows[0];
      const [profiles]: any = await userPool.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
      const profile = profiles[0] || {
        name: '',
        profession: '',
        address: '',
        city: '',
        phone_number: user.phone_number,
        email: '',
        age: null,
      };

      return res.json({
        success: true,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          name: profile.name || '',
          status: user.status,
          profile_completed: user.profile_completed,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          profile,
        },
      });
    } else {
      const user = fallbackStore.userDb.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === user.id) || {
        id: user.id,
        user_id: user.id,
        name: '',
        profession: '',
        address: '',
        city: '',
        phone_number: user.phone_number,
        email: '',
        age: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.json({
        success: true,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          name: profile.name || '',
          status: user.status,
          profile_completed: user.profile_completed,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          profile,
        },
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve user session.' });
  }
});
