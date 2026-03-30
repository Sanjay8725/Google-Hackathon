const { supabaseAdmin } = require('../config/supabase');

exports.getMySchedule = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('id, event_id, ticket_type, qr_code, created_at, events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const schedule = (data || []).map((row) => ({
      registration_id: row.id,
      ticket_type: row.ticket_type,
      qr_code: row.qr_code,
      event: row.events
    }));

    return res.json({ success: true, schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch schedule.' });
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', eventId).single();
    if (error) return res.status(404).json({ success: false, message: 'Event not found.' });
    return res.json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event.' });
  }
};

exports.getQRCode = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const eventId = Number(req.params.eventId);

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('id, qr_code, event_id, user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Registration not found.' });
    return res.json({ success: true, qr: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch QR code.' });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*, events(title, date)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, feedback: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch feedback.' });
  }
};

exports.submitFeedbackToEvent = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const eventId = Number(req.params.eventId);
    const rating = Number(req.body?.rating);
    const comment = req.body?.comment || '';

    if (!rating) {
      return res.status(400).json({ success: false, message: 'rating is required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .upsert({ user_id: userId, event_id: eventId, rating, comment }, { onConflict: 'event_id,user_id' })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, feedback: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit feedback.' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return res.json({ success: true, notifications: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications.' });
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const eventId = Number(req.params.eventId);

    const [{ data: user, error: userError }, { data: event, error: eventError }, { data: attendance, error: attendanceError }] = await Promise.all([
      supabaseAdmin.from('users').select('id, name, email').eq('id', userId).single(),
      supabaseAdmin.from('events').select('id, title, date').eq('id', eventId).single(),
      supabaseAdmin.from('attendance').select('checked_in_at').eq('user_id', userId).eq('event_id', eventId).maybeSingle()
    ]);

    if (userError || eventError) {
      return res.status(404).json({ success: false, message: 'User or event not found.' });
    }

    if (attendanceError) throw attendanceError;

    return res.json({
      success: true,
      certificate: {
        user_name: user.name,
        event_title: event.title,
        event_date: event.date,
        attended: Boolean(attendance),
        issued_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate certificate.' });
  }
};
