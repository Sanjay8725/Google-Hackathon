const bcrypt = require('bcryptjs');
const { supabaseAuth, supabaseAdmin } = require('../config/supabase');

function normalizeRole(inputRole) {
  const role = String(inputRole || 'attendee').toLowerCase();
  if (['admin', 'organizer', 'attendee'].includes(role)) {
    return role;
  }
  return 'attendee';
}

async function getUserByIdentifier(identifier) {
  const value = String(identifier || '').trim();
  if (!value) {
    return null;
  }

  if (value.includes('@')) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, supabase_uid, name, username, email, role')
      .eq('email', value)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, supabase_uid, name, username, email, role')
    .eq('username', value)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function ensureLocalUserFromAuth(authUser, roleOverride) {
  const metadata = authUser.user_metadata || {};
  const role = normalizeRole(roleOverride || metadata.role);
  const email = authUser.email;
  const username = metadata.username || (email ? email.split('@')[0] : `user_${authUser.id.slice(0, 8)}`);
  const name = metadata.name || username;

  const { data: existing, error: findError } = await supabaseAdmin
    .from('users')
    .select('id, supabase_uid, name, username, email, role')
    .eq('supabase_uid', authUser.id)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: byEmail, error: byEmailError } = await supabaseAdmin
    .from('users')
    .select('id, supabase_uid, name, username, email, role')
    .eq('email', email)
    .maybeSingle();

  if (byEmailError) throw byEmailError;

  if (byEmail) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ supabase_uid: authUser.id, role })
      .eq('id', byEmail.id)
      .select('id, supabase_uid, name, username, email, role')
      .single();

    if (updateError) throw updateError;
    return updated;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      supabase_uid: authUser.id,
      name,
      username,
      email,
      role,
      password_hash: await bcrypt.hash(Math.random().toString(36), 8)
    })
    .select('id, supabase_uid, name, username, email, role')
    .single();

  if (insertError) throw insertError;
  return inserted;
}

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body || {};

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const safeRole = normalizeRole(role);

    const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          role: safeRole
        }
      }
    });

    if (signUpError) {
      return res.status(400).json({ success: false, message: signUpError.message });
    }

    const authUser = signUpData && signUpData.user;
    if (!authUser) {
      return res.status(400).json({ success: false, message: 'Signup failed. Please verify email confirmation settings.' });
    }

    const localUser = await ensureLocalUserFromAuth(authUser, safeRole);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: localUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    const requestedRole = normalizeRole(req.params.role || req.body?.role || 'attendee');

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'usernameOrEmail and password are required.' });
    }

    const userRecord = await getUserByIdentifier(usernameOrEmail);
    const loginEmail = (userRecord && userRecord.email) || usernameOrEmail;

    if (!String(loginEmail).includes('@')) {
      return res.status(400).json({ success: false, message: 'Please login with email for this account.' });
    }

    const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (signInError || !signInData.user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const localUser = await ensureLocalUserFromAuth(signInData.user, requestedRole);

    if (localUser.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `Use ${localUser.role} login role for this account.`
      });
    }

    return res.json({
      success: true,
      message: 'Login successful.',
      user: localUser,
      session: {
        access_token: signInData.session ? signInData.session.access_token : null,
        refresh_token: signInData.session ? signInData.session.refresh_token : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, supabase_uid, name, username, email, role, created_at')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load profile.' });
  }
};
