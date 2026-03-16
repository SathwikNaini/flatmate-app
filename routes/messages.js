import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification, notificationTypes } from '../utils/notifications.js';

const router = express.Router();

// Get messages between two users (sorted by timestamp)
router.get('/:receiverId', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      `SELECT id, sender_id, receiver_id, content, created_at 
       FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [req.user.id, req.params.receiverId, req.params.receiverId, req.user.id]
    );
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send message (with notification)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, content]
    );

    // Get sender name for notification
    const [senderProfile] = await pool.execute(
      'SELECT name FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    const senderName = senderProfile[0]?.name || 'Someone';

    // Create notification for receiver
    await createNotification(
      receiver_id,
      notificationTypes.NEW_MESSAGE,
      `${senderName} sent you a message`,
      req.user.id
    );

    const newMessageData = {
      id: result.insertId,
      sender_id: req.user.id,
      receiver_id,
      content,
      created_at: new Date()
    };

    // Emit real-time socket event if user is online
    const io = req.app.get('io');
    if (io && global.onlineUsers) {
      const receiverSocketId = global.onlineUsers.get(String(receiver_id));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessageData);
      }
    }

    res.json(newMessageData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow sender to delete their own message
    const [result] = await pool.execute(
      'DELETE FROM messages WHERE id = ? AND sender_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message not found or you are not authorized to delete it' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
