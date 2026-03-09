import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT n.*, p.name as related_user_name 
       FROM notifications n
       LEFT JOIN profiles p ON n.related_user_id = p.user_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ count: result[0].count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark notification as read
router.post('/read', authenticateToken, async (req, res) => {
  try {
    const { notification_id } = req.body;

    if (notification_id) {
      // Mark specific notification as read
      await pool.execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [notification_id, req.user.id]
      );
    } else {
      // Mark all notifications as read
      await pool.execute(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
        [req.user.id]
      );
    }

    res.json({ message: 'Notification(s) marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete all notifications for current user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete specific notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
