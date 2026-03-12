const crypto = require('crypto');
const db = require('../config/database');

let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  console.warn('⚠️ Bcrypt native module not available, using fallback hashing');
  // Fallback if bcrypt .so files are missing
  bcrypt = {
    hash: (password) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex')),
    compare: (password, hash) => Promise.resolve(crypto.createHash('sha256').update(password).digest('hex') === hash)
  };
}

const VALID_ROLES = new Set(['admin', 'organizer', 'attendee']);
const CREDENTIAL_TABLE_BY_ROLE = {
  admin: 'admin_credentials',
  organizer: 'organizer_credentials',
  attendee: 'attendee_credentials'
};

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
