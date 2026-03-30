require('dotenv').config();

const { supabaseAdmin } = require('./server/config/supabase');

async function main() {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('Supabase connectivity OK. users rows sample:', data.length);
  } catch (err) {
    console.error('Supabase connectivity failed:', err.message);
    process.exit(1);
  }
}

main();
