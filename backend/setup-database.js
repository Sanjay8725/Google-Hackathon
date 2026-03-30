require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { supabaseAdmin } = require('./server/config/supabase');

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL (or DATABASE_URL) is required.');
  }

  const schemaPath = path.join(__dirname, 'server', 'database', 'supabase', '01_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = new Client({
    connectionString,
    ssl: process.env.SUPABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  console.log('Applying Supabase schema...');
  await client.connect();
  await client.query(schemaSql);
  await client.end();

  const { error } = await supabaseAdmin.from('users').select('id').limit(1);
  if (error) {
    console.error('Supabase connection failed:', error.message);
    process.exit(1);
  }

  console.log('Supabase connection verified. Database schema is ready.');
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
