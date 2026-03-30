const { supabaseAdmin } = require('./supabase');

async function query(table, builder) {
  let q = supabaseAdmin.from(table);
  q = builder(q);
  return q;
}

module.exports = {
  query,
  execute: query,
  getConnection: async () => ({ query, release: () => {} }),
  checkConnection: async () => {
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);
    return { ok: !error, error: error ? error.message : null };
  },
  isSupabase: () => true,
  getSafeConfig: () => ({ provider: 'supabase' })
};
