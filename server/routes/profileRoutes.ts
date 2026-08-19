import { Router, Response } from 'express';
import { userPool, fallbackStore, isDbConnected } from '../db';
import { requireUserAuth, AuthRequest } from '../auth';

export const profileRouter = Router();

// GET /api/profile
profileRouter.get('/', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isDbConnected() && userPool) {
      const [users]: any = await userPool.query('SELECT id, phone_number, status, profile_completed FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      const user = users[0];
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
          status: user.status,
          profile_completed: user.profile_completed,
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
          status: user.status,
          profile_completed: user.profile_completed,
          profile,
        },
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to load profile details.' });
  }
});

// PUT /api/profile
profileRouter.put('/', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, profession, address, city, email, age } = req.body;

    const trimmedName = String(name || '').trim();
    const trimmedProfession = String(profession || '').trim();
    const trimmedAddress = String(address || '').trim();
    const trimmedCity = String(city || '').trim();
    const trimmedEmail = String(email || '').trim();
    const parsedAge = age ? Number(age) : null;

    // Check if required profile fields for completion are filled
    const isCompleted = trimmedName.length > 0 && trimmedCity.length > 0 ? 1 : 0;

    if (isDbConnected() && userPool) {
      // Upsert into user_profiles
      const [existing]: any = await userPool.query('SELECT id FROM user_profiles WHERE user_id = ?', [userId]);
      if (existing.length > 0) {
        await userPool.query(
          `UPDATE user_profiles 
           SET name = ?, profession = ?, address = ?, city = ?, email = ?, age = ?, updated_at = NOW() 
           WHERE user_id = ?`,
          [trimmedName, trimmedProfession, trimmedAddress, trimmedCity, trimmedEmail, parsedAge, userId]
        );
      } else {
        await userPool.query(
          `INSERT INTO user_profiles (user_id, name, profession, address, city, phone_number, email, age) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, trimmedName, trimmedProfession, trimmedAddress, trimmedCity, req.user!.phone_number, trimmedEmail, parsedAge]
        );
      }

      // Update profile_completed flag on users table
      await userPool.query('UPDATE users SET profile_completed = ? WHERE id = ?', [isCompleted, userId]);

      const [profiles]: any = await userPool.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: userId,
          phone_number: req.user!.phone_number,
          status: req.user!.status,
          profile_completed: isCompleted,
          name: trimmedName,
          profile: profiles[0],
        },
      });
    } else {
      let profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === userId);
      const now = new Date().toISOString();
      if (profile) {
        profile.name = trimmedName;
        profile.profession = trimmedProfession;
        profile.address = trimmedAddress;
        profile.city = trimmedCity;
        profile.email = trimmedEmail;
        profile.age = parsedAge;
        profile.updated_at = now;
      } else {
        profile = {
          id: fallbackStore.userDb.user_profiles.length + 1,
          user_id: userId,
          name: trimmedName,
          profession: trimmedProfession,
          address: trimmedAddress,
          city: trimmedCity,
          phone_number: req.user!.phone_number,
          email: trimmedEmail,
          age: parsedAge,
          created_at: now,
          updated_at: now,
        };
        fallbackStore.userDb.user_profiles.push(profile);
      }

      const user = fallbackStore.userDb.users.find(u => u.id === userId);
      if (user) {
        user.profile_completed = isCompleted;
        user.updated_at = now;
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: userId,
          phone_number: req.user!.phone_number,
          status: req.user!.status,
          profile_completed: isCompleted,
          name: trimmedName,
          profile,
        },
      });
    }
  } catch (err: any) {
    console.error('Profile Update Error:', err);
    return res.status(500).json({ success: false, error: 'Could not save profile changes.' });
  }
});
