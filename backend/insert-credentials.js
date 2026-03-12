// Quick script to generate bcrypt hashes and insert credentials
const crypto = require('crypto');
const mysql = require('mysql2/promise');

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

async function insertCredentials() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Ammu',
    database: 'event_management'
  });

  try {
    // Generate hashes
    const hash = await bcrypt.hash('admin123', 10);
    const hash2 = await bcrypt.hash('organizer123', 10);
    const hash3 = await bcrypt.hash('attendee123', 10);

    console.log('Generated hashes:');
    console.log('admin123 hash:', hash);
    console.log('organizer123 hash:', hash2);
    console.log('attendee123 hash:', hash3);

    const conn = await pool.getConnection();
    
    // Clear existing
    await conn.execute('SET FOREIGN_KEY_CHECKS=0');
    await conn.execute('DELETE FROM admin_credentials');
    await conn.execute('DELETE FROM organizer_credentials');
    await conn.execute('DELETE FROM attendee_credentials');

    // Insert credentials
    await conn.execute(
      'INSERT INTO admin_credentials (user_id, password_hash) VALUES (?, ?)',
      [1, hash]
    );
    console.log('✅ Admin credentials inserted');

    await conn.execute(
      'INSERT INTO organizer_credentials (user_id, password_hash) VALUES (?, ?)',
      [2, hash2]
    );
    console.log('✅ Organizer credentials inserted');

    await conn.execute(
      'INSERT INTO attendee_credentials (user_id, password_hash) VALUES (?, ?)',
      [3, hash3]
    );
    console.log('✅ Attendee credentials inserted');

    conn.release();
    console.log('\n✅ All credentials inserted successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@eventflow.com / admin123');
    console.log('  Organizer: organizer@eventflow.com / organizer123');
    console.log('  Attendee: attendee@eventflow.com / attendee123');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

insertCredentials();
