const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

exports.getDashboard = async (_req, res) => {
  try {
    const [users, events, registrations, attendance, feedback] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('events').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('feedback').select('rating')
    ]);

    const ratings = feedback.data || [];
    const avgRating = ratings.length
      ? ratings.reduce((sum, row) => sum + Number(row.rating || 0), 0) / ratings.length
      : 0;

    return res.json({
      success: true,
      stats: {
        overview: {
          totalUsers: users.count || 0,
          totalEvents: events.count || 0,
          totalRegistrations: registrations.count || 0,
          totalAttendance: attendance.count || 0,
          averageRating: Number(avgRating.toFixed(2))
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load dashboard.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();

    let query = supabaseAdmin
      .from('users')
      .select('id, supabase_uid, name, username, email, role, organizer_status, created_at')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, users: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load users.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const payload = req.body || {};
    const passwordHash = await bcrypt.hash(String(payload.password || 'password123'), 10);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        name: payload.name || payload.username || 'User',
        username: payload.username || String(payload.email || '').split('@')[0],
        email: payload.email,
        role: payload.role || 'attendee',
        organizer_status: payload.organizer_status || 'active',
        password_hash: passwordHash
      })
      .select('id, name, username, email, role, organizer_status, created_at')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, user: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create user.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const updates = { ...req.body };
    delete updates.id;
    delete updates.supabase_uid;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, username, email, role, organizer_status, created_at')
      .single();

    if (error) throw error;
    return res.json({ success: true, user: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update user.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (error) throw error;
    return res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete user.' });
  }
};

exports.getOrganizers = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, username, email, role, organizer_status, created_at')
      .eq('role', 'organizer')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, organizers: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load organizers.' });
  }
};

exports.updateOrganizerStatus = async (req, res) => {
  try {
    const organizerId = Number(req.params.organizerId);
    const status = req.body?.status || 'active';

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ organizer_status: status })
      .eq('id', organizerId)
      .eq('role', 'organizer')
      .select('id, name, organizer_status')
      .single();

    if (error) throw error;
    return res.json({ success: true, organizer: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update organizer status.' });
  }
};

exports.getEvents = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, events: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to load events.' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const row = {
      organizer_id: toInt(payload.organizer_id, null),
      title: payload.title,
      description: payload.description || '',
      date: payload.date,
      time: payload.time || '',
      location: payload.location || '',
      capacity: toInt(payload.capacity, 0),
      category: payload.category || null,
      venue_type: payload.venue_type || null,
      status: payload.status || 'Upcoming',
      approved: Boolean(payload.approved || false)
    };

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create event.' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const updates = { ...req.body };

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update event.' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId);
    if (error) throw error;
    return res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete event.' });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ approved: true, status: 'Upcoming' })
      .eq('id', eventId)
      .select('*')
      .single();

    if (error) throw error;
    return res.json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to approve event.' });
  }
};

exports.getSystemAnalytics = async (_req, res) => {
  try {
    const [events, feedback] = await Promise.all([
      supabaseAdmin.from('events').select('id, category, status, created_at'),
      supabaseAdmin.from('feedback').select('rating, created_at')
    ]);

    const ratings = feedback.data || [];
    const avgRating = ratings.length
      ? ratings.reduce((sum, row) => sum + Number(row.rating || 0), 0) / ratings.length
      : 0;

    return res.json({
      success: true,
      analytics: {
        eventCount: (events.data || []).length,
        feedbackCount: ratings.length,
        averageRating: Number(avgRating.toFixed(2))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics.' });
  }
};

exports.getRegistrations = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*, users(name, email), events(title, date)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, registrations: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch registrations.' });
  }
};

exports.exportRegistrations = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('id, event_id, user_id, ticket_type, qr_code, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const header = ['id', 'event_id', 'user_id', 'ticket_type', 'qr_code', 'created_at'];
    const csv = [header.join(',')]
      .concat(rows.map((row) => header.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to export registrations.' });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const type = String(req.query.type || 'summary');
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    return res.json({
      success: true,
      report: {
        type,
        startDate,
        endDate,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate report.' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const payload = req.body || {};
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: payload.title || 'Announcement',
        message: payload.message || '',
        audience: payload.audience || 'all',
        created_by: payload.created_by ? Number(payload.created_by) : null
      })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, announcement: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create announcement.' });
  }
};

exports.getFeedback = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*, users(name, email), events(title)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, feedback: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch feedback.' });
  }
};

exports.getSettings = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, settings: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const payload = req.body || {};
    const upserts = Object.keys(payload).map((key) => ({ setting_key: key, setting_value: payload[key] }));

    if (upserts.length === 0) {
      return res.json({ success: true, settings: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .upsert(upserts, { onConflict: 'setting_key' })
      .select('*');

    if (error) throw error;
    return res.json({ success: true, settings: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update settings.' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const limit = Math.min(500, Number(req.query.limit || 100));
    const offset = Number(req.query.offset || 0);

    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return res.json({ success: true, logs: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch activity logs.' });
  }
};
