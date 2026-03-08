import pool from '../db.js';

export const createNotification = async (userId, type, message, relatedUserId = null) => {
  try {
    await pool.execute(
      `INSERT INTO notifications (user_id, type, message, related_user_id) 
       VALUES (?, ?, ?, ?)`,
      [userId, type, message, relatedUserId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notificationTypes = {
  CONNECTION_REQUEST: 'connection_request',
  CONNECTION_ACCEPTED: 'connection_accepted',
  NEW_MESSAGE: 'new_message'
};
