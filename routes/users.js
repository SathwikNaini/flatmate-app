import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get online users
router.get('/online', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT p.user_id, p.name, p.location, p.age 
       FROM profiles p
       WHERE p.is_online = TRUE AND p.user_id != ?`,
      [req.user.id]
    );

    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update online status
router.post('/status', authenticateToken, async (req, res) => {
  try {
    const { is_online } = req.body;

    await pool.execute(
      'UPDATE profiles SET is_online = ? WHERE user_id = ?',
      [is_online, req.user.id]
    );

    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const [user] = await pool.execute(
      'SELECT push_notifications as push, email_notifications as email, matches_notifications as matches, messages_notifications as messages FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user.length) return res.status(404).json({ error: 'User not found' });

    // Return booleans instead of 1/0
    res.json({
      push: !!user[0].push,
      email: !!user[0].email,
      matches: !!user[0].matches,
      messages: !!user[0].messages
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { push, email, matches, messages } = req.body;
    await pool.execute(
      'UPDATE users SET push_notifications = ?, email_notifications = ?, matches_notifications = ?, messages_notifications = ? WHERE id = ?',
      [!!push, !!email, !!matches, !!messages, req.user.id]
    );
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user info by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT p.user_id, p.name, p.age, p.location, p.bio, p.preferences, p.profile_pic, u.email, u.created_at
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
