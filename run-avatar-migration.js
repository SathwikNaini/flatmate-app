import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('🔄 Starting avatar column migration...');

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  // Add SSL for production - accept self-signed certificates
  if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if columns exist
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles'`,
      [process.env.DB_NAME]
    );

    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('📋 Existing columns:', columnNames);

    // Add avatar_base64 if it doesn't exist
    if (!columnNames.includes('avatar_base64')) {
      console.log('➕ Adding avatar_base64 column...');
      await connection.execute(
        'ALTER TABLE profiles ADD COLUMN avatar_base64 LONGTEXT'
      );
      console.log('✅ avatar_base64 column added');
    } else {
      console.log('✓ avatar_base64 column already exists');
    }

    // Add profile_pic if it doesn't exist
    if (!columnNames.includes('profile_pic')) {
      console.log('➕ Adding profile_pic column...');
      await connection.execute(
        'ALTER TABLE profiles ADD COLUMN profile_pic VARCHAR(500)'
      );
      console.log('✅ profile_pic column added');
    } else {
      console.log('✓ profile_pic column already exists');
    }

    // Verify final structure
    const [finalColumns] = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles'`,
      [process.env.DB_NAME]
    );

    console.log('\n📊 Final profiles table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
