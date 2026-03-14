#!/usr/bin/env node

const mysql = require('mysql2/promise');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (_e1) {
  console.warn('⚠️ bcryptjs not available, using fallback hashing');
  bcrypt = {
    hash: (password) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex')),
    compare: (password, hash) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex') === hash)
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test credentials - Change these values
const TEST_CREDENTIALS = [
  {
    username: 'admin',
    email: 'admin@eventflow.com',
    password: 'admin123', // CHANGE THIS
    role: 'admin',
    name: 'Admin User'
  },
  {
    username: 'organizer',
    email: 'organizer@eventflow.com',
    password: 'organizer123', // CHANGE THIS
    role: 'organizer',
    name: 'John Organizer'
  },
  {
    username: 'attendee',
    email: 'attendee@eventflow.com',
    password: 'attendee123', // CHANGE THIS
    role: 'attendee',
    name: 'Alice Attendee'
  }
];

async function setupCredentials() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🔐 Setting up credentials...\n');

    for (const credential of TEST_CREDENTIALS) {
      const { username, email, password, role, name } = credential;
      
      // Check if user exists by email
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      let userId;

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`✅ User already exists: ${email} / @${username} (ID: ${userId})`);
      } else {
        // Create new user
        const [result] = await connection.query(
          'INSERT INTO users (name, username, email, role) VALUES (?, ?, ?, ?)',
          [name, username, email, role]
        );
        userId = result.insertId;
        console.log(`✅ Created user: ${name} (@${username}, ${email}) - ID: ${userId}`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Get credentials table name
      const credTableMap = {
        admin: 'admin_credentials',
        organizer: 'organizer_credentials',
        attendee: 'attendee_credentials'
      };

      const credTable = credTableMap[role];

      // Check if credentials exist
      const [existingCreds] = await connection.query(
        `SELECT user_id FROM ${credTable} WHERE user_id = ?`,
        [userId]
      );

      if (existingCreds.length > 0) {
        // Update existing credentials
        await connection.query(
          `UPDATE ${credTable} SET password_hash = ? WHERE user_id = ?`,
          [hashedPassword, userId]
        );
        console.log(`   ✏️  Updated password for ${role}: ${email}`);
      } else {
        // Insert new credentials
        await connection.query(
          `INSERT INTO ${credTable} (user_id, password_hash) VALUES (?, ?)`,
          [userId, hashedPassword]
        );
        console.log(`   ✏️  Created password for ${role}: ${email}`);
      }

      console.log(`   📝 Temporary password: ${password}`);
      console.log(`   ⚠️  IMPORTANT: Change this password after first login!\n`);
    }

    console.log('\n✨ Credentials setup complete!');
    console.log('\n📋 Test Login Credentials:');
    console.log('━'.repeat(60));
    
    TEST_CREDENTIALS.forEach(cred => {
      console.log(`\n${cred.role.toUpperCase()}:`);
      console.log(`  Username: @${cred.username}`);
      console.log(`  Email: ${cred.email}`);
      console.log(`  Password: ${cred.password}`);
      console.log(`  → Login with Username OR Email`);
    });
    
    console.log('\n━'.repeat(60));
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('  - These are TEMPORARY credentials for testing only');
    console.log('  - Change all passwords immediately after first login');
    console.log('  - Never use these credentials in production');
    console.log('  - Update users to change their passwords regularly\n');

  } catch (error) {
    console.error('❌ Error setting up credentials:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

// Run setup
setupCredentials();
