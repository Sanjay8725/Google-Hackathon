require('dotenv').config();

const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('./server/config/supabase');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        name: 'Admin User',
        username: 'admin',
        email,
        role: 'admin',
        organizer_status: 'active',
        password_hash: hash
      },
      { onConflict: 'email' }
    )
    .select('id, name, username, email, role')
    .single();

  if (error) throw error;
  console.log('Admin credentials record ready:', data);
}

createAdmin().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
