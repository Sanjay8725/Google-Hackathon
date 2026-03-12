#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load env from workspace root when present.
dotenv.config({ path: path.join(__dirname, '..', '.env') });

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'event_management';
const SEED_DATA = (process.env.DB_SEED_DATA || 'true').toLowerCase() === 'true';

async function runSqlFile(connection, filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await connection.query(sql);
  console.log(`✅ ${label}`);
}

async function setupDatabase() {
  let connection;

  try {
    console.log('🔄 Connecting to MySQL...');

    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    const schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
    const testDataPath = path.join(__dirname, 'server', 'database', 'test_data.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    console.log('🏗️  Applying schema...');
    await runSqlFile(connection, schemaPath, 'Schema applied');

    if (SEED_DATA && fs.existsSync(testDataPath)) {
      console.log('🌱 Inserting seed data...');
      await runSqlFile(connection, testDataPath, 'Seed data inserted');
    } else {
      console.log('ℹ️  Seed data skipped');
    }

    console.log('\n🎉 Database setup complete');
    console.log(`📦 Database: ${DB_NAME}`);
    console.log('➡️ Next step: npm run setup-credentials');
    console.log('➡️ Then run backend: npm start');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
