const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');

const provider = String(process.env.DB_PROVIDER || 'mysql').toLowerCase();
const useSupabase = provider === 'supabase';

const mysqlConfig = {
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

const mysqlPool = mysql.createPool(mysqlConfig);

const pgConnectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
const pgPool = useSupabase
  ? new PgPool({
      connectionString: pgConnectionString,
      ssl: process.env.SUPABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.DB_CONNECTION_LIMIT || 10)
    })
  : null;

let lastConnectionError = null;

function convertMySqlPlaceholdersToPg(sql) {
  let index = 0;
  return String(sql).replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

async function runPgQuery(client, sql, params = []) {
  const text = convertMySqlPlaceholdersToPg(sql);
  const result = await client.query(text, params);
  const normalized = String(sql).trim().toUpperCase();

  if (normalized.startsWith('SELECT') || normalized.startsWith('WITH')) {
    return [result.rows, []];
  }

  if (normalized.startsWith('INSERT')) {
    let insertId = null;

    if (/\bRETURNING\b/i.test(sql) && result.rows && result.rows[0] && typeof result.rows[0].id !== 'undefined') {
      insertId = result.rows[0].id;
    } else {
      try {
        const tableMatch = String(sql).match(/insert\s+into\s+([a-zA-Z0-9_\."`]+)/i);
        const rawTable = tableMatch ? tableMatch[1] : null;
        if (rawTable) {
          const sanitizedTable = rawTable.replace(/["`]/g, '');
          const seqResult = await client.query("SELECT pg_get_serial_sequence($1, 'id') AS seq", [sanitizedTable]);
          const seqName = seqResult.rows[0] && seqResult.rows[0].seq;
          if (seqName) {
            const idResult = await client.query('SELECT currval($1::regclass) AS id', [seqName]);
            insertId = idResult.rows[0] ? idResult.rows[0].id : null;
          }
        }
      } catch (_err) {
        insertId = null;
      }
    }

    return [
      {
        insertId,
        affectedRows: result.rowCount,
        rowCount: result.rowCount,
        rows: result.rows
      },
      []
    ];
  }

  return [
    {
      affectedRows: result.rowCount,
      rowCount: result.rowCount,
      rows: result.rows
    },
    []
  ];
}

async function checkConnection() {
  try {
    if (useSupabase) {
      if (!pgConnectionString) {
        throw new Error('SUPABASE_DB_URL (or DATABASE_URL) is required when DB_PROVIDER=supabase');
      }
      const client = await pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      lastConnectionError = null;
      return { connected: true };
    }

    const connection = await mysqlPool.getConnection();
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
  if (useSupabase) {
    const client = await pgPool.connect();
    try {
      return await runPgQuery(client, sql, params);
    } finally {
      client.release();
    }
  }

  return mysqlPool.query(sql, params);
}

async function execute(sql, params = []) {
  if (useSupabase) {
    return query(sql, params);
  }

  return mysqlPool.execute(sql, params);
}

async function getConnection() {
  if (!useSupabase) {
    return mysqlPool.getConnection();
  }

  const client = await pgPool.connect();

  return {
    query: (sql, params = []) => runPgQuery(client, sql, params),
    execute: (sql, params = []) => runPgQuery(client, sql, params),
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release()
  };
}

checkConnection()
  .then((state) => {
    if (state.connected) {
      console.log(`✅ ${useSupabase ? 'Supabase(Postgres)' : 'MySQL'} Database connected successfully`);
      return;
    }

    console.warn(`⚠️  ${useSupabase ? 'Supabase' : 'MySQL'} connection warning:`, state.error);
    console.warn('    API will work with mock data. Real DB operations will fail.');
  })
  .catch(() => {
    // This catch is only for unexpected failures in the connection check flow.
  });

const database = useSupabase ? pgPool : mysqlPool;

module.exports = database;
module.exports.query = query;
module.exports.execute = execute;
module.exports.getConnection = getConnection;
module.exports.checkConnection = checkConnection;
module.exports.isSupabase = () => useSupabase;
module.exports.getLastConnectionError = () => lastConnectionError;
module.exports.getSafeConfig = () => {
  if (useSupabase) {
    return {
      provider: 'supabase',
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
    };
  }

  return {
    provider: 'mysql',
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    database: mysqlConfig.database,
    connectionLimit: mysqlConfig.connectionLimit
  };
};
