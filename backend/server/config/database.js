const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection (non-blocking)
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.warn('⚠️  MySQL connection warning:', err.message);
    console.warn('    API will work with mock data. Real DB operations will fail.');
  });

module.exports = pool;
