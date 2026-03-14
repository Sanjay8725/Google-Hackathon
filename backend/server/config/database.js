const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

let lastConnectionError = null;

async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    lastConnectionError = null;
    return { connected: true };
  } catch (err) {
    lastConnectionError = err;
    return {
      connected: false,
      error: err.message
    };
  }
}

async function query(sql, params = []) {
  return pool.query(sql, params);
}

async function execute(sql, params = []) {
  return pool.execute(sql, params);
}

// Test connection (non-blocking)
checkConnection()
  .then((state) => {
    if (state.connected) {
      console.log('✅ MySQL Database connected successfully');
      return;
    }

    console.warn('⚠️  MySQL connection warning:', state.error);
    console.warn('    API will work with mock data. Real DB operations will fail.');
  })
  .catch(() => {
    // This catch is only for unexpected failures in the connection check flow.
  });

module.exports = pool;
module.exports.query = query;
module.exports.execute = execute;
module.exports.checkConnection = checkConnection;
module.exports.getLastConnectionError = () => lastConnectionError;
module.exports.getSafeConfig = () => ({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  connectionLimit: dbConfig.connectionLimit
});
