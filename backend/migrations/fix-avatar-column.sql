-- Fix avatar_base64 column issue
-- Run this on your Render MySQL database

USE flatmate_db;

-- Add avatar_base64 column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_base64 LONGTEXT;

-- Add profile_pic column if it doesn't exist (for file uploads)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_pic VARCHAR(500);

-- Verify the columns were added
DESCRIBE profiles;
