import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { connectionRequestLimiter } from '../middleware/rateLimiter.js';
import { createNotification, notificationTypes } from '../utils/notifications.js';

const router = express.Router();

// Send connection request (with duplicate check and rate limiting)
router.post('/', authenticateToken, connectionRequestLimiter, async (req, res) => {
  try {
    const { receiver_id } = req.body;

    // Check for duplicate connection (pending or accepted)
    const [existing] = await pool.execute(
      `SELECT * FROM connections 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND status IN ('pending', 'accepted')`,
      [req.user.id, receiver_id, receiver_id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    const [result] = await pool.execute(
      'INSERT INTO connections (sender_id, receiver_id, status) VALUES (?, ?, ?)',
      [req.user.id, receiver_id, 'pending']
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
      notificationTypes.CONNECTION_REQUEST,
      `${senderName} sent you a connection request`,
      req.user.id
    );

    res.json({ id: result.insertId, sender_id: req.user.id, receiver_id, status: 'pending' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get incoming requests
router.get('/incoming', authenticateToken, async (req, res) => {
  try {
    const [connections] = await pool.execute(
      `SELECT c.*, p.name, p.age, p.bio, p.location, p.profile_pic 
       FROM connections c 
       JOIN profiles p ON c.sender_id = p.user_id 
       WHERE c.receiver_id = ? AND c.status = 'pending'`,
      [req.user.id]
    );
    res.json(connections);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get accepted matches
router.get('/accepted', authenticateToken, async (req, res) => {
  try {
    const [connections] = await pool.execute(
      `SELECT c.*, p.name, p.age, p.bio, p.location, p.profile_pic, p.user_id as match_user_id
       FROM connections c 
       JOIN profiles p ON (c.sender_id = p.user_id OR c.receiver_id = p.user_id)
       WHERE (c.sender_id = ? OR c.receiver_id = ?) 
       AND c.status = 'accepted' 
       AND p.user_id != ?`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json(connections);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update connection status (with notification)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    // Get connection details before updating
    const [connection] = await pool.execute(
      'SELECT * FROM connections WHERE id = ?',
      [req.params.id]
    );

    if (connection.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await pool.execute(
      'UPDATE connections SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    // If accepted, notify the sender
    if (status === 'accepted') {
      const senderId = connection[0].sender_id;
      const [receiverProfile] = await pool.execute(
        'SELECT name FROM profiles WHERE user_id = ?',
        [req.user.id]
      );

      const receiverName = receiverProfile[0]?.name || 'Someone';

      await createNotification(
        senderId,
        notificationTypes.CONNECTION_ACCEPTED,
        `${receiverName} accepted your connection request`,
        req.user.id
      );
    }

    res.json({ message: 'Connection updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NEW: Get connection status with a specific user
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const [connections] = await pool.execute(
      `SELECT status FROM connections 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`,
      [req.user.id, userId, userId, req.user.id]
    );

    if (connections.length === 0) {
      return res.json({ status: 'not_connected' });
    }

    const status = connections[0].status;
    if (status === 'accepted') {
      return res.json({ status: 'connected' });
    } else if (status === 'pending') {
      return res.json({ status: 'pending' });
    } else {
      return res.json({ status: 'not_connected' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
