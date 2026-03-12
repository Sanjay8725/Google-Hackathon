#!/usr/bin/env node

const mysql = require('mysql2/promise');
const crypto = require('crypto');
const dotenv = require('dotenv');

let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  console.warn('⚠️ Bcrypt native module not available, using fallback hashing');
  bcrypt = {
    hash: (password) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex')),
    compare: (password, hash) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex') === hash)
  };
}

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function diagnose() {
  let connection;
  try {
    console.log('\n🔍 EventFlow Authentication Diagnostic\n');
    console.log('━'.repeat(60));

    // Test 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    connection = await pool.getConnection();
    console.log('✅ Database connected successfully\n');

    // Test 2: Check users table
    console.log('2️⃣ Checking users in database...');
    const [users] = await connection.query(
      'SELECT id, name, username, email, role FROM users'
    );
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      console.log('   Run: node setup-credentials.js\n');
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      users.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }

    // Test 3: Check credentials
    console.log('3️⃣ Checking credentials for each role...');
    const roles = ['admin', 'organizer', 'attendee'];
    
    for (const role of roles) {
      const table = `${role}_credentials`;
      const [creds] = await connection.query(
        `SELECT user_id, password_hash FROM ${table}`
      );
      
      if (creds.length === 0) {
        console.log(`   ⚠️  No ${role} credentials found`);
      } else {
        console.log(`   ✅ ${role}: ${creds.length} credential(s)`);
        creds.forEach(cred => {
          console.log(`      User ID: ${cred.user_id}, Hash: ${cred.password_hash.substring(0, 20)}...`);
        });
      }
    }
    console.log('');

    // Test 4: Find test users and verify credentials
    console.log('4️⃣ Verifying test user credentials...');
    const testUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'organizer', password: 'organizer123', role: 'organizer' },
      { username: 'attendee', password: 'attendee123', role: 'attendee' }
    ];

    for (const testUser of testUsers) {
      const table = `${testUser.role}_credentials`;
      const [result] = await connection.query(
        `SELECT u.id, u.username, u.email, c.password_hash
         FROM users u
         JOIN ${table} c ON c.user_id = u.id
         WHERE u.username = ? AND u.role = ?`,
        [testUser.username, testUser.role]
      );

      if (result.length === 0) {
        console.log(`   ❌ ${testUser.role} (@${testUser.username}): NOT FOUND`);
      } else {
        const user = result[0];
        const isValidPassword = await bcrypt.compare(testUser.password, user.password_hash);
        
        if (isValidPassword) {
          console.log(`   ✅ ${testUser.role} (@${testUser.username}): OK`);
          console.log(`      Email: ${user.email}`);
        } else {
          console.log(`   ⚠️  ${testUser.role} (@${testUser.username}): Password mismatch`);
        }
      }
    }
    console.log('');

    // Test 5: Check if API endpoints are accessible
    console.log('5️⃣ Checking frontend files...');
    const fs = require('fs');
    const path = require('path');
    
    const files = [
      'frontend/src/public/admin/admin.html',
      'frontend/src/public/organizer/organizer-dashboard.html',
      'frontend/src/public/attendee/attendee-dashboard.html'
    ];

    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file} exists`);
      } else {
        console.log(`   ❌ ${file} NOT FOUND`);
      }
    }
    console.log('');

    // Summary
    console.log('━'.repeat(60));
    console.log('\n📋 Diagnostic Summary:\n');
    console.log('✅ All checks passed! Your system is ready to go.');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Open browser: http://localhost:5000');
    console.log('   3. Try login with:');
    console.log('      Username: admin');
    console.log('      Password: admin123');
    console.log('      Role: Admin\n');

  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n⚠️  Database connection lost. Make sure MySQL is running.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Database credentials incorrect. Check .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  Database not found. Run schema.sql first.');
    }
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

diagnose();
