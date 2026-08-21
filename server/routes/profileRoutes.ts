import { Router, Response } from 'express';
import { userPool, fallbackStore, isDbConnected } from '../db';
import { requireUserAuth, AuthRequest } from '../auth';

export const profileRouter = Router();

// POST /api/profile/sync - Save user profile to database (called after login)
profileRouter.post('/sync', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, city, profession, address, age, phone_number } = req.body;

    if (isDbConnected() && userPool) {
      // Update user profile in database
      await userPool.query(
        `UPDATE user_profiles SET 
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          city = COALESCE(?, city),
          profession = COALESCE(?, profession),
          address = COALESCE(?, address),
          age = COALESCE(?, age),
          updated_at = NOW()
        WHERE user_id = ?`,
        [name, email, city, profession, address, age, userId]
      );

      // Check if profile_completed should be updated
      const [profile]: any = await userPool.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      // Mark profile as complete if name and email are provided
      const profileCompleted = profile[0]?.name && profile[0]?.email ? 1 : 0;
      if (profileCompleted) {
        await userPool.query(
          'UPDATE users SET profile_completed = ? WHERE id = ?',
          [profileCompleted, userId]
        );
      }

      // Return updated profile
      const [updatedProfile]: any = await userPool.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        message: 'Profile synchronized successfully',
        profile: updatedProfile[0] || {}
      });
    } else {
      // Fallback in-memory
      const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === userId);
      if (profile) {
        if (name) profile.name = name;
        if (email) profile.email = email;
        if (city) profile.city = city;
        if (profession) profile.profession = profession;
        if (address) profile.address = address;
        if (age !== null && age !== undefined) profile.age = age;
        profile.updated_at = new Date().toISOString();
      }

      // Mark profile complete if name and email exist
      const user = fallbackStore.userDb.users.find(u => u.id === userId);
      if (user && profile?.name && profile?.email) {
        user.profile_completed = 1;
      }

      return res.json({
        success: true,
        message: 'Profile synchronized successfully',
        profile: profile || {}
      });
    }
  } catch (err: any) {
    console.error('Profile Sync Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to sync profile.' });
  }
});

// GET /api/profile/get - Get user profile
profileRouter.get('/get', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isDbConnected() && userPool) {
      const [profiles]: any = await userPool.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        profile: profiles[0] || {}
      });
    } else {
      const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === userId);
      return res.json({
        success: true,
        profile: profile || {}
      });
    }
  } catch (err: any) {
    console.error('Get Profile Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
});

// PUT /api/profile/update - Update user profile
profileRouter.put('/update', requireUserAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, city, profession, address, age, phone_number } = req.body;

    if (isDbConnected() && userPool) {
      await userPool.query(
        `UPDATE user_profiles SET 
          name = ?, email = ?, city = ?, profession = ?, address = ?, age = ?, updated_at = NOW()
        WHERE user_id = ?`,
        [name, email, city, profession, address, age, userId]
      );

      // Update profile_completed status
      const profileCompleted = name && email ? 1 : 0;
      await userPool.query(
        'UPDATE users SET profile_completed = ? WHERE id = ?',
        [profileCompleted, userId]
      );

      const [updatedProfile]: any = await userPool.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile[0] || {}
      });
    } else {
      const profile = fallbackStore.userDb.user_profiles.find(p => p.user_id === userId);
      if (profile) {
        profile.name = name || profile.name;
        profile.email = email || profile.email;
        profile.city = city || profile.city;
        profile.profession = profession || profile.profession;
        profile.address = address || profile.address;
        profile.age = age || profile.age;
        profile.updated_at = new Date().toISOString();
      }

      const user = fallbackStore.userDb.users.find(u => u.id === userId);
      if (user) {
        user.profile_completed = name && email ? 1 : 0;
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: profile || {}
      });
    }
  } catch (err: any) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});
