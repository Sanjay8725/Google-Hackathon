const crypto = require('crypto');
const db = require('../config/database');

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

const VALID_ROLES = new Set(['admin', 'organizer', 'attendee']);
const SELF_SIGNUP_ROLES = new Set(['attendee']);
const CREDENTIAL_TABLE_BY_ROLE = {
  admin: 'admin_credentials',
  organizer: 'organizer_credentials',
  attendee: 'attendee_credentials'
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function isSupabaseAuthEnabled() {
  const provider = String(process.env.AUTH_PROVIDER || process.env.DB_PROVIDER || '').toLowerCase();
  return provider === 'supabase' && Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

function usernameFromEmail(email) {
  return String(email || '')
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30) || `user_${Date.now()}`;
}

async function supabaseAuthRequest(path, body) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(body)
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_err) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && (payload.msg || payload.message || payload.error_description || payload.error);
    throw new Error(message || `Supabase auth failed (${response.status})`);
  }

  return payload;
}

async function findOrCreateLocalUserFromSupabase({ role, email, name, username, supabaseUid }) {
  try {
    const [existingByUid] = await db.query(
      'SELECT id, name, username, email, role FROM users WHERE supabase_uid = ? LIMIT 1',
      [supabaseUid]
    );

    if (existingByUid.length > 0) {
      return existingByUid[0];
    }

    const [existingByEmail] = await db.query(
      'SELECT id, name, username, email, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingByEmail.length > 0) {
      await db.query('UPDATE users SET supabase_uid = ? WHERE id = ?', [supabaseUid, existingByEmail[0].id]);
      return {
        ...existingByEmail[0],
        role: existingByEmail[0].role || role
      };
    }

    const safeUsername = username || usernameFromEmail(email);
    const safeName = name || safeUsername;

    const [insertResult] = await db.query(
      'INSERT INTO users (name, username, email, role, supabase_uid) VALUES (?, ?, ?, ?, ?)',
      [safeName, safeUsername, email, role, supabaseUid]
    );

    return {
      id: insertResult.insertId || supabaseUid,
      name: safeName,
      username: safeUsername,
      email,
      role
    };
  } catch (_err) {
    // If DB is unavailable, still allow auth success from Supabase cloud.
    return {
      id: supabaseUid,
      name: name || usernameFromEmail(email),
      username: username || usernameFromEmail(email),
      email,
      role
    };
  }
}

function getCredentialsTable(role) {
  if (!VALID_ROLES.has(role)) {
    return null;
  }

  return CREDENTIAL_TABLE_BY_ROLE[role];
}

// Register new user
exports.register = async (req, res) => {
  const { name, username, email, password, role } = req.body;
  const safeRole = role || 'attendee';

  // Validation
  if (!name || !email || !password || !username) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide name, username, email, and password' 
    });
  }

  if (!VALID_ROLES.has(safeRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  if (!SELF_SIGNUP_ROLES.has(safeRole)) {
    return res.status(403).json({
      success: false,
      message: 'Sign up is available only for attendee accounts. Please contact admin.'
    });
  }

  if (isSupabaseAuthEnabled()) {
    try {
      const signup = await supabaseAuthRequest('/auth/v1/signup', {
        email,
        password,
        data: {
          name,
          username,
          role: safeRole
        }
      });

      const supabaseUser = signup && signup.user;
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(400).json({
          success: false,
          message: 'Supabase signup did not return a user. Check email confirmation settings.'
        });
      }

      const appUser = await findOrCreateLocalUserFromSupabase({
        role: safeRole,
        email,
        name,
        username,
        supabaseUid: supabaseUser.id
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: appUser
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Supabase signup failed'
      });
    }
  }

  try {
    // Check if email exists
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if username exists
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const credentialsTable = getCredentialsTable(safeRole);
    if (!credentialsTable) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, username, email, role) VALUES (?, ?, ?, ?)',
      [name, username, email, safeRole]
    );

    await db.query(
      `INSERT INTO ${credentialsTable} (user_id, password_hash) VALUES (?, ?)`,
      [result.insertId, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        name,
        username,
        email,
        role: safeRole
      }
    });
  } catch (dbError) {
    // Database unavailable - use mock signup
    console.warn('⚠️ Database connection failed, using mock registration...');
    
    // Store in mock users (in-memory, will be lost on server restart)
    const newMockUser = {
      id: Math.max(...Object.values(mockUsers).flatMap(users => users.map(u => u.id)), 0) + 1,
      name,
      username,
      email,
      password,
      role: safeRole
    };
    
    if (!mockUsers[safeRole]) mockUsers[safeRole] = [];
    mockUsers[safeRole].push(newMockUser);
    
    console.log('✅ Mock registration successful for', email);
    res.status(201).json({
      success: true,
      message: 'User registered successfully (mock data)',
      user: {
        id: newMockUser.id,
        name,
        username,
        email,
        role: safeRole
      }
    });
  }
};

// Login user (deprecated)
exports.login = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Use role-specific login endpoints: /api/auth/login/admin, /organizer, /attendee'
  });
};

// Mock data for testing when database is unavailable
const mockUsers = {
  admin: [
    { id: 1, name: 'Admin User', email: 'admin@eventflow.com', username: 'admin', password: 'admin123', role: 'admin' }
  ],
  organizer: [
    { id: 2, name: 'Event Organizer', email: 'organizer@eventflow.com', username: 'organizer', password: 'organizer123', role: 'organizer' }
  ],
  attendee: [
    { id: 3, name: 'John Attendee', email: 'attendee@eventflow.com', username: 'attendee', password: 'attendee123', role: 'attendee' }
  ]
};

async function loginByRole(req, res, role) {
  const { usernameOrEmail, password } = req.body;

  // Validation
  if (!usernameOrEmail || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username/email and password'
    });
  }

  const credentialsTable = getCredentialsTable(role);
  if (!credentialsTable) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  if (isSupabaseAuthEnabled()) {
    try {
      let loginEmail = String(usernameOrEmail).trim();
      const usingEmail = loginEmail.includes('@');

      if (!usingEmail) {
        try {
          const [rows] = await db.query(
            'SELECT email FROM users WHERE username = ? AND role = ? LIMIT 1',
            [loginEmail, role]
          );

          if (rows.length > 0) {
            loginEmail = rows[0].email;
          } else {
            return res.status(400).json({
              success: false,
              message: 'Please login with email for this account.'
            });
          }
        } catch (_err) {
          return res.status(400).json({
            success: false,
            message: 'Please login with email when database lookup is unavailable.'
          });
        }
      }

      const tokenPayload = await supabaseAuthRequest('/auth/v1/token?grant_type=password', {
        email: loginEmail,
        password
      });

      const supabaseUser = tokenPayload && tokenPayload.user;
      if (!supabaseUser || !supabaseUser.id) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const metadataRole =
        (supabaseUser.user_metadata && supabaseUser.user_metadata.role) ||
        (supabaseUser.app_metadata && supabaseUser.app_metadata.role) ||
        role;

      if (String(metadataRole) !== String(role)) {
        // Role-specific endpoint guard.
        return res.status(403).json({
          success: false,
          message: `Use the ${metadataRole} login role for this account`
        });
      }

      const appUser = await findOrCreateLocalUserFromSupabase({
        role,
        email: supabaseUser.email,
        name: (supabaseUser.user_metadata && supabaseUser.user_metadata.name) || null,
        username: (supabaseUser.user_metadata && supabaseUser.user_metadata.username) || null,
        supabaseUid: supabaseUser.id
      });

      return res.json({
        success: true,
        message: 'Login successful',
        user: appUser
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials'
      });
    }
  }

  try {
    // Check if input is email or username (email contains @)
    const isEmail = usernameOrEmail.includes('@');
    
    let users;
    if (isEmail) {
      [users] = await db.query(
        `SELECT u.id, u.name, u.email, u.username, u.role, c.password_hash
         FROM users u
         JOIN ${credentialsTable} c ON c.user_id = u.id
         WHERE u.email = ? AND u.role = ?`,
        [usernameOrEmail, role]
      );
    } else {
      [users] = await db.query(
        `SELECT u.id, u.name, u.email, u.username, u.role, c.password_hash
         FROM users u
         JOIN ${credentialsTable} c ON c.user_id = u.id
         WHERE u.username = ? AND u.role = ?`,
        [usernameOrEmail, role]
      );
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (dbError) {
    // Database unavailable - attempt mock data fallback
    console.warn('⚠️ Database connection failed, attempting mock data fallback...');
    
    const mockUserList = mockUsers[role] || [];
    const mockUser = mockUserList.find(u => 
      (u.email === usernameOrEmail || u.username === usernameOrEmail) && u.password === password
    );

    if (mockUser) {
      console.log('✅ Mock login successful for', mockUser.email);
      return res.json({
        success: true,
        message: 'Login successful (mock data)',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role
        }
      });
    }

    console.error('❌ Login error:', dbError.message);
    res.status(503).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
}

exports.loginAdmin = async (req, res) => loginByRole(req, res, 'admin');
exports.loginOrganizer = async (req, res) => loginByRole(req, res, 'organizer');
exports.loginAttendee = async (req, res) => loginByRole(req, res, 'attendee');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT id, name, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get profile' 
    });
  }
};
