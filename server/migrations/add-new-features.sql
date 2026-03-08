-- Migration: Add new features to Flatmate Finder
-- Run this in MySQL Workbench

USE flatmate_db;

-- Add is_online column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('connection_request', 'connection_accepted', 'new_message') NOT NULL,
  message TEXT NOT NULL,
  related_user_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Create request_count table for rate limiting
CREATE TABLE IF NOT EXISTS request_count (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_type VARCHAR(50) NOT NULL,
  count INT DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_request_count_user ON request_count(user_id, request_type);
