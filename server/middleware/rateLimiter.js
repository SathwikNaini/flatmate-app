import pool from '../db.js';

export const connectionRequestLimiter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestType = 'connection_request';
    const limit = 5;
    const windowMinutes = 1;

    // Clean up old entries (older than window)
    await pool.execute(
      `DELETE FROM request_count 
       WHERE user_id = ? 
       AND request_type = ? 
       AND window_start < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [userId, requestType, windowMinutes]
    );

    // Get current count
    const [rows] = await pool.execute(
      `SELECT count, window_start FROM request_count 
       WHERE user_id = ? AND request_type = ?`,
      [userId, requestType]
    );

    if (rows.length > 0) {
      const { count } = rows[0];

      if (count >= limit) {
        return res.status(429).json({
          error: `Too many requests. Maximum ${limit} connection requests per minute allowed.`
        });
      }

      // Increment count
      await pool.execute(
        `UPDATE request_count SET count = count + 1 WHERE user_id = ? AND request_type = ?`,
        [userId, requestType]
      );
    } else {
      // Create new entry
      await pool.execute(
        `INSERT INTO request_count (user_id, request_type, count) VALUES (?, ?, 1)`,
        [userId, requestType]
      );
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(); // Don't block request if rate limiter fails
  }
};
