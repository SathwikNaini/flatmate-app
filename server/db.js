import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration with SSL support for production
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Add SSL configuration for production (required by most cloud MySQL providers)
if (process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: true
  };
}

const pool = mysql.createPool(dbConfig);

// Test connection and log status
pool.getConnection()
  .then(connection => {
    console.log('✅ Database pool created successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database pool creation failed:', err.message);
  });

export default pool;
