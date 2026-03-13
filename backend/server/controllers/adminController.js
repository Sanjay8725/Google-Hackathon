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
const EVENT_STATUSES = new Set(['Planning', 'Upcoming', 'Live', 'Completed', 'Cancelled']);

const adminSettingsStore = {
  platform: {
    maintenanceMode: false,
    registrationApprovalRequired: false,
    defaultTimezone: 'UTC'
  },
  security: {
    enforceStrongPasswords: true,
    certificateTemplatesEnabled: true,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 120
  },
  categories: []
};

let announcementsTableEnsured = false;
let platformSettingsTableEnsured = false;

async function ensureAnnouncementsTable() {
  if (announcementsTableEnsured) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      target ENUM('organizers', 'attendees', 'all') DEFAULT 'all',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  announcementsTableEnsured = true;
}

async function ensurePlatformSettingsTable() {
  if (platformSettingsTableEnsured) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(150) NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  platformSettingsTableEnsured = true;
}

function getCredentialsTable(role) {
  if (!VALID_ROLES.has(role)) {
    return null;
  }

  return CREDENTIAL_TABLE_BY_ROLE[role];
}

function sanitizeUsernameBase(value) {
  const base = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);

  return base || 'user';
}

function generateSecurePassword(length = 10) {
  // URL-safe characters; remove ambiguous symbols for easier sharing.
  return crypto
    .randomBytes(Math.ceil(length * 0.8))
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

async function generateUniqueUsername(connection, preferredBase) {
  const base = sanitizeUsernameBase(preferredBase);
  let candidate = base;
  let attempt = 0;

  while (attempt < 50) {
    const [rows] = await connection.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [candidate]
    );

    if (rows.length === 0) {
      return candidate;
    }

    attempt += 1;
    candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
  }

  // Last resort: deterministic + timestamp suffix
  return `${base}${Date.now().toString().slice(-4)}`;
}

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Users by role
    const [usersByRole] = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    
    // Total events
    const [totalEvents] = await db.query('SELECT COUNT(*) as count FROM events');
    
    // Events by status
    const [eventsByStatus] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM events 
      GROUP BY status
    `);
    
    // Total registrations
    const [totalRegistrations] = await db.query('SELECT COUNT(*) as count FROM registrations');
    
    // Total attendance
    const [totalAttendance] = await db.query('SELECT COUNT(*) as count FROM attendance');
    
    // Total feedback
    const [totalFeedback] = await db.query('SELECT COUNT(*) as count FROM feedback');
    
    // Average rating across all events
    const [avgRating] = await db.query('SELECT AVG(avg_rating) as rating FROM events WHERE avg_rating > 0');
    
    // Recent activities (last 10)
    const [recentActivities] = await db.query(`
      SELECT 
        el.action,
        el.timestamp,
        u.name as user_name,
        e.title as event_name
      FROM engagement_logs el
      JOIN users u ON el.user_id = u.id
      LEFT JOIN events e ON el.event_id = e.id
      ORDER BY el.timestamp DESC
      LIMIT 10
    `);
    
    // Revenue estimate (assuming $50 per registration)
    const totalRevenue = totalRegistrations[0].count * 50;
    
    // Growth metrics (last 30 days)
    const [newUsersLast30Days] = await db.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    const [newEventsLast30Days] = await db.query(`
      SELECT COUNT(*) as count 
      FROM events 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers: totalUsers[0].count,
          totalEvents: totalEvents[0].count,
          totalRegistrations: totalRegistrations[0].count,
          totalAttendance: totalAttendance[0].count,
          totalFeedback: totalFeedback[0].count,
          avgRating: parseFloat(avgRating[0].rating || 0).toFixed(2),
          totalRevenue: `$${totalRevenue}`
        },
        usersByRole,
        eventsByStatus,
        growth: {
          newUsersLast30Days: newUsersLast30Days[0].count,
          newEventsLast30Days: newEventsLast30Days[0].count
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get dashboard statistics' 
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [users] = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [total] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      users,
      total: total[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get users' 
    });
  }
};

// Search users by keyword (name/email) with optional role filter
exports.searchUsers = async (req, res) => {
  try {
    const { q = '', role, limit = 50, offset = 0 } = req.query;
    const keyword = String(q).trim();

    let query = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (keyword) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [users] = await db.query(query, params);

    res.json({
      success: true,
      users,
      query: keyword,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// Create user with role-based credentials
exports.createUser = async (req, res) => {
  const { name, email, password, role, username } = req.body;
  const safeRole = role || 'attendee';
  const providedPassword = String(password || '').trim();
  const generatedPassword = generateSecurePassword();
  const finalPassword = providedPassword || generatedPassword;
  const passwordWasAutoGenerated = !providedPassword;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name and email'
    });
  }

  const credentialsTable = getCredentialsTable(safeRole);
  if (!credentialsTable) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const finalUsername = await generateUniqueUsername(
      connection,
      username || name || email.split('@')[0]
    );

    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const [result] = await connection.query(
      'INSERT INTO users (name, username, email, role) VALUES (?, ?, ?, ?)',
      [name, finalUsername, email, safeRole]
    );

    await connection.query(
      `INSERT INTO ${credentialsTable} (user_id, password_hash) VALUES (?, ?)`,
      [result.insertId, hashedPassword]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        name,
        username: finalUsername,
        email,
        role: safeRole
      },
      credentials: {
        username: finalUsername,
        password: finalPassword,
        autoGeneratedPassword: passwordWasAutoGenerated
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Update user (role change, ban, etc.)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name, email, is_active } = req.body;
    
    const updates = [];
    const params = [];
    
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (typeof is_active !== 'undefined') {
      updates.push('is_active = ?');
      params.push(Boolean(is_active));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No updates provided' 
      });
    }
    
    params.push(id);
    
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
};

// Get organizers with verification status
exports.getOrganizers = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.is_active,
        u.created_at,
        COALESCE(op.organization_name, '') AS organization_name,
        COALESCE(op.verification_status, 'pending') AS verification_status
      FROM users u
      LEFT JOIN organizer_profiles op ON op.user_id = u.id
      WHERE u.role = 'organizer'
    `;
    const params = [];

    if (status) {
      query += ' AND COALESCE(op.verification_status, \'pending\') = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR COALESCE(op.organization_name, \'\') LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [organizers] = await db.query(query, params);

    res.json({
      success: true,
      organizers,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Get organizers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get organizers'
    });
  }
};

// Approve or reject organizer
exports.updateOrganizerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = new Set(['pending', 'verified', 'rejected']);

    if (!allowed.has(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await db.query(
      `
      INSERT INTO organizer_profiles (user_id, verification_status)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE verification_status = VALUES(verification_status)
      `,
      [id, status]
    );

    if (status === 'rejected') {
      await db.query('UPDATE users SET is_active = FALSE WHERE id = ? AND role = \'organizer\'', [id]);
    }

    if (status === 'verified') {
      await db.query('UPDATE users SET is_active = TRUE WHERE id = ? AND role = \'organizer\'', [id]);
    }

    res.json({
      success: true,
      message: 'Organizer status updated'
    });
  } catch (error) {
    console.error('Update organizer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organizer status'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
};

// Get all events (with advanced filters)
exports.getAllEvents = async (req, res) => {
  try {
    const { status, organizer, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, u.name as organizer_name, u.email as organizer_email
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    
    if (organizer) {
      query += ' AND e.organizer_id = ?';
      params.push(organizer);
    }
    
    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [events] = await db.query(query, params);
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get events' 
    });
  }
};

// Search events by keyword (title/description) with optional status and organizer filters
exports.searchEvents = async (req, res) => {
  try {
    const { q = '', status, organizer, limit = 50, offset = 0 } = req.query;
    const keyword = String(q).trim();

    let query = `
      SELECT e.*, u.name as organizer_name, u.email as organizer_email
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (keyword) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (organizer) {
      query += ' AND e.organizer_id = ?';
      params.push(organizer);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [events] = await db.query(query, params);

    res.json({
      success: true,
      events,
      query: keyword,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search events'
    });
  }
};

// Create event from admin portal
exports.createEvent = async (req, res) => {
  try {
    const {
      organizer_id,
      title,
      description,
      date,
      time,
      location,
      status,
      capacity,
      category
    } = req.body;

    const normalizedTitle = String(title || '').trim();
    const normalizedDate = String(date || '').trim();
    const normalizedCategory = String(category || '').trim();
    const organizerId = Number(organizer_id);
    const normalizedStatus = EVENT_STATUSES.has(String(status || '').trim())
      ? String(status).trim()
      : 'Planning';

    if (!organizerId || !normalizedTitle || !normalizedDate || !normalizedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Organizer, title, date, and category are required'
      });
    }

    const [organizerRows] = await db.query(
      'SELECT id, role FROM users WHERE id = ? LIMIT 1',
      [organizerId]
    );

    if (organizerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organizer account not found'
      });
    }

    const ownerRole = String(organizerRows[0].role || '').toLowerCase();
    if (!['organizer', 'admin'].includes(ownerRole)) {
      return res.status(403).json({
        success: false,
        message: 'Selected user cannot own an event'
      });
    }

    const [result] = await db.query(
      `INSERT INTO events
      (organizer_id, title, description, date, time, location, status, capacity, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizerId,
        normalizedTitle,
        String(description || '').trim(),
        normalizedDate,
        String(time || '').trim(),
        String(location || '').trim(),
        normalizedStatus,
        Number(capacity || 0),
        normalizedCategory
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Admin create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

// Approve event
exports.approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      'UPDATE events SET status = ? WHERE id = ?',
      ['Upcoming', id]
    );

    res.json({
      success: true,
      message: 'Event approved successfully'
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve event' 
    });
  }
};

// Update event from admin portal
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ['title', 'description', 'date', 'time', 'location', 'status', 'capacity', 'category'];
    const updates = [];
    const values = [];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid event fields provided'
      });
    }

    values.push(id);
    await db.query(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Admin update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete event' 
    });
  }
};

// Get registrations (optionally filtered by event)
exports.getRegistrations = async (req, res) => {
  try {
    const { eventId, search, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        r.id,
        r.event_id,
        e.title AS event_title,
        r.user_id,
        u.name AS attendee_name,
        u.email AS attendee_email,
        r.ticket_type,
        r.payment_status,
        r.registration_date
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      JOIN users u ON u.id = r.user_id
      WHERE 1 = 1
    `;
    const params = [];

    if (eventId) {
      query += ' AND r.event_id = ?';
      params.push(eventId);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR e.title LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.registration_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [registrations] = await db.query(query, params);

    res.json({
      success: true,
      registrations,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get registrations'
    });
  }
};

// Export registrations CSV
exports.exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.query;

    let query = `
      SELECT
        r.id,
        e.title AS event_title,
        u.name AS attendee_name,
        u.email AS attendee_email,
        r.ticket_type,
        r.payment_status,
        r.registration_date
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      JOIN users u ON u.id = r.user_id
      WHERE 1 = 1
    `;
    const params = [];

    if (eventId) {
      query += ' AND r.event_id = ?';
      params.push(eventId);
    }

    query += ' ORDER BY r.registration_date DESC';
    const [rows] = await db.query(query, params);

    const header = 'registration_id,event_title,attendee_name,attendee_email,ticket_type,payment_status,registration_date';
    const csvRows = rows.map((row) => [
      row.id,
      `"${String(row.event_title || '').replace(/"/g, '""')}"`,
      `"${String(row.attendee_name || '').replace(/"/g, '""')}"`,
      `"${String(row.attendee_email || '').replace(/"/g, '""')}"`,
      `"${String(row.ticket_type || '').replace(/"/g, '""')}"`,
      `"${String(row.payment_status || '').replace(/"/g, '""')}"`,
      `"${new Date(row.registration_date).toISOString()}"`
    ].join(','));

    const csv = [header].concat(csvRows).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="registrations-${eventId || 'all'}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export registrations'
    });
  }
};

// Get system-wide analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    // Event performance over time
    const [eventTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as event_count,
        SUM(registered) as total_registrations,
        AVG(engagement) as avg_engagement,
        AVG(avg_rating) as avg_rating
      FROM events
      WHERE date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month
      ORDER BY month
    `);
    
    // Top performing events
    const [topEvents] = await db.query(`
      SELECT 
        id, title, registered, engagement, avg_rating, feedback_count
      FROM events
      ORDER BY (engagement + avg_rating * 20) DESC
      LIMIT 10
    `);
    
    // Most active organizers
    const [topOrganizers] = await db.query(`
      SELECT 
        u.id, u.name, u.email,
        COUNT(e.id) as event_count,
        SUM(e.registered) as total_attendees,
        AVG(e.avg_rating) as avg_rating
      FROM users u
      JOIN events e ON u.id = e.organizer_id
      WHERE u.role = 'organizer'
      GROUP BY u.id
      ORDER BY event_count DESC
      LIMIT 10
    `);
    
    // Category distribution
    const [categoryStats] = await db.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(registered) as total_attendees
      FROM events
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      analytics: {
        eventTrends,
        topEvents,
        topOrganizers,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get system analytics' 
    });
  }
};

// Generate reports
exports.generateReports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let report = {};
    
    if (type === 'user-activity') {
      const [userActivity] = await db.query(`
        SELECT 
          u.id, u.name, u.email, u.role,
          COUNT(DISTINCT r.id) as registrations,
          COUNT(DISTINCT a.id) as attendance,
          COUNT(DISTINCT f.id) as feedback_given
        FROM users u
        LEFT JOIN registrations r ON u.id = r.user_id
        LEFT JOIN attendance a ON u.id = a.user_id
        LEFT JOIN feedback f ON u.id = f.user_id
        WHERE u.created_at BETWEEN ? AND ?
        GROUP BY u.id
        ORDER BY registrations DESC
      `, [startDate || '2020-01-01', endDate || '2030-12-31']);
      
      report = { type: 'user-activity', data: userActivity };
    } 
    else if (type === 'event-performance') {
      const [eventPerformance] = await db.query(`
        SELECT 
          e.id, e.title, e.date, e.status,
          e.capacity, e.registered, e.checked_in,
          e.engagement, e.avg_rating, e.feedback_count,
          u.name as organizer
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.date BETWEEN ? AND ?
        ORDER BY e.date DESC
      `, [startDate || '2020-01-01', endDate || '2030-12-31']);
      
      report = { type: 'event-performance', data: eventPerformance };
    }
    else if (type === 'revenue') {
      const [revenueData] = await db.query(`
        SELECT 
          DATE_FORMAT(r.registration_date, '%Y-%m') as month,
          COUNT(*) as registrations,
          COUNT(*) * 50 as estimated_revenue
        FROM registrations r
        WHERE r.registration_date BETWEEN ? AND ?
        GROUP BY month
        ORDER BY month
      `, [startDate || '2020-01-01', endDate || '2030-12-31']);
      
      report = { type: 'revenue', data: revenueData };
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Generate reports error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate report' 
    });
  }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, target = 'all', created_by = null } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    await ensureAnnouncementsTable();

    await db.query(
      'INSERT INTO announcements (title, message, target, created_by) VALUES (?, ?, ?, ?)',
      [title, message, target, created_by]
    );

    res.json({
      success: true,
      message: 'Announcement created successfully'
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create announcement' 
    });
  }
};

// Get attendee feedback and complaints
exports.getFeedback = async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT
        f.id,
        f.rating,
        f.comment,
        f.improvement_suggestions,
        f.submitted_at,
        u.name AS attendee_name,
        u.email AS attendee_email,
        e.title AS event_title
      FROM feedback f
      JOIN users u ON u.id = f.user_id
      JOIN events e ON e.id = f.event_id
      WHERE 1 = 1
    `;
    const params = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR e.title LIKE ? OR f.comment LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY f.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [feedback] = await db.query(query, params);

    res.json({
      success: true,
      feedback,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feedback'
    });
  }
};

// Get admin settings
exports.getSettings = async (req, res) => {
  try {
    await ensurePlatformSettingsTable();

    const [categoryRows] = await db.query(`
      SELECT category, COUNT(*) AS count
      FROM events
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `);

    const categories = categoryRows.map((row) => ({
      name: row.category,
      count: row.count
    }));

    if (adminSettingsStore.categories.length === 0) {
      adminSettingsStore.categories = categories.map((item) => item.name);
    }

    const [settingRows] = await db.query(
      'SELECT setting_value FROM platform_settings WHERE setting_key = ? LIMIT 1',
      ['certificate_templates_enabled']
    );

    if (settingRows.length > 0) {
      adminSettingsStore.security.certificateTemplatesEnabled = String(settingRows[0].setting_value) === 'true';
    }

    res.json({
      success: true,
      settings: {
        platform: adminSettingsStore.platform,
        security: adminSettingsStore.security,
        categories: adminSettingsStore.categories,
        categoryUsage: categories
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

// Update admin settings
exports.updateSettings = async (req, res) => {
  try {
    await ensurePlatformSettingsTable();

    const { platform, security, categories } = req.body;

    if (platform && typeof platform === 'object') {
      adminSettingsStore.platform = {
        ...adminSettingsStore.platform,
        ...platform
      };
    }

    if (security && typeof security === 'object') {
      adminSettingsStore.security = {
        ...adminSettingsStore.security,
        ...security
      };

      if (Object.prototype.hasOwnProperty.call(security, 'certificateTemplatesEnabled')) {
        await db.query(
          `
          INSERT INTO platform_settings (setting_key, setting_value)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
          `,
          ['certificate_templates_enabled', String(Boolean(security.certificateTemplatesEnabled))]
        );
      }
    }

    if (Array.isArray(categories)) {
      adminSettingsStore.categories = categories
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: adminSettingsStore
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const [logs] = await db.query(`
      SELECT 
        el.id,
        el.action,
        el.timestamp,
        u.name as user_name,
        u.email as user_email,
        e.title as event_name
      FROM engagement_logs el
      JOIN users u ON el.user_id = u.id
      LEFT JOIN events e ON el.event_id = e.id
      ORDER BY el.timestamp DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get activity logs' 
    });
  }
};
