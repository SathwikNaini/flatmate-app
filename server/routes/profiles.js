import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// IMPORTANT: Specific routes MUST come before parameterized routes like /:userId

// Search profiles by location (MUST be before /:userId)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    console.log('Search request for location:', location, 'by user:', req.user.id);

    const [profiles] = await pool.execute(
      `SELECT p.* FROM profiles p
       WHERE p.user_id != ?
       AND p.location LIKE ?
       AND p.user_id NOT IN (
         SELECT CASE 
           WHEN sender_id = ? THEN receiver_id
           WHEN receiver_id = ? THEN sender_id
         END as connected_user_id
         FROM connections
         WHERE (sender_id = ? OR receiver_id = ?)
         AND status IN ('accepted', 'pending')
       )`,
      [req.user.id, `%${location}%`, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    console.log('Search results:', profiles.length, 'profiles found');
    res.json(profiles);
  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get suggested flatmates (Improved with scoring)
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    console.log('Suggestions request by user:', req.user.id);

    // Get current user's profile
    const [currentProfile] = await pool.execute(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    const userProfile = currentProfile[0] || {};
    const location = userProfile.location || '';
    const age = userProfile.age || 0;

    // Scoring Logic in SQL:
    // Base compatibility + Location match (20 pts) + Location fuzzy match (10 pts) + Age proximity (10 pts)
    const [profiles] = await pool.execute(
      `SELECT p.*,
        (
          50 + 
          (CASE WHEN p.location = ? THEN 30 ELSE 0 END) +
          (CASE WHEN p.location LIKE ? AND p.location != ? THEN 15 ELSE 0 END) +
          (CASE WHEN p.age BETWEEN ? AND ? THEN 10 ELSE 0 END)
        ) as compatibility_score
       FROM profiles p
       WHERE p.user_id != ?
       AND p.user_id NOT IN (
         SELECT CASE 
           WHEN sender_id = ? THEN receiver_id
           WHEN receiver_id = ? THEN sender_id
         END as connected_user_id
         FROM connections
         WHERE (sender_id = ? OR receiver_id = ?)
         AND status IN ('accepted', 'pending')
       )
       ORDER BY compatibility_score DESC, p.created_at DESC
       LIMIT 12`,
      [
        location,
        `%${location}%`, location,
        age - 5, age + 5,
        req.user.id,
        req.user.id, req.user.id, req.user.id, req.user.id
      ]
    );

    console.log('Suggestions found:', profiles.length);
    res.json(profiles);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get all profiles except current user and already connected users (with pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [profiles] = await pool.execute(
      `SELECT p.* FROM profiles p
       WHERE p.user_id != ?
       AND p.user_id NOT IN (
         SELECT CASE 
           WHEN sender_id = ? THEN receiver_id
           WHEN receiver_id = ? THEN sender_id
         END as connected_user_id
         FROM connections
         WHERE (sender_id = ? OR receiver_id = ?)
         AND status IN ('accepted', 'pending')
       )
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, limit, offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM profiles p
       WHERE p.user_id != ?
       AND p.user_id NOT IN (
         SELECT CASE 
           WHEN sender_id = ? THEN receiver_id
           WHEN receiver_id = ? THEN sender_id
         END as connected_user_id
         FROM connections
         WHERE (sender_id = ? OR receiver_id = ?)
         AND status IN ('accepted', 'pending')
       )`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({
      profiles,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get profile by user ID (MUST be after specific routes)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.execute(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.params.userId]
    );
    res.json(profiles[0] || null);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create or update profile (POST)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, age, bio, location, preferences, avatar_base64 } = req.body;

    console.log('Profile update request for user:', req.user.id);
    console.log('Update data:', { name, age, bio, location, preferences, avatar_included: !!avatar_base64 });

    const [existing] = await pool.execute(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE profiles SET name = ?, age = ?, bio = ?, location = ?, preferences = ?, avatar_base64 = ? WHERE user_id = ?',
        [name, age, bio, location, preferences, avatar_base64, req.user.id]
      );
      console.log('Profile updated successfully');
    } else {
      await pool.execute(
        'INSERT INTO profiles (user_id, name, age, bio, location, preferences, avatar_base64) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, name, age, bio, location, preferences, avatar_base64]
      );
      console.log('Profile created successfully');
    }

    // Fetch and return the updated profile
    const [profile] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    console.log('Returning updated profile:', profile[0]);
    res.json(profile[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update profile (PUT) - Alternative RESTful endpoint
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { name, age, bio, location, preferences, avatar_base64 } = req.body;

    console.log('Profile PUT update request for user:', req.user.id);
    console.log('Update data:', { name, age, bio, location, preferences, avatar_included: !!avatar_base64 });

    const [existing] = await pool.execute(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE profiles SET name = ?, age = ?, location = ?, bio = ?, preferences = ?, avatar_base64 = ? WHERE user_id = ?',
        [name, age, location, bio, preferences, avatar_base64, req.user.id]
      );
      console.log('Profile updated successfully via PUT');
    } else {
      await pool.execute(
        'INSERT INTO profiles (user_id, name, age, bio, location, preferences, avatar_base64) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, name, age, bio, location, preferences, avatar_base64]
      );
      console.log('Profile created successfully via PUT');
    }

    // Fetch and return the updated profile
    const [profile] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    console.log('Returning updated profile:', profile[0]);
    res.json(profile[0]);
  } catch (error) {
    console.error('Profile PUT update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Upload profile picture
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create the public URL for the image
    const imageUrl = `/uploads/${req.file.filename}`;

    // Ensure profile exists before updating
    const [existing] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    if (existing.length === 0) {
      await pool.execute('INSERT INTO profiles (user_id, profile_pic) VALUES (?, ?)', [req.user.id, imageUrl]);
    } else {
      await pool.execute('UPDATE profiles SET profile_pic = ? WHERE user_id = ?', [imageUrl, req.user.id]);
    }

    res.json({ message: 'Profile picture updated', profile_pic: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
