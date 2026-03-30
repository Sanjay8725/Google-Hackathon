const { supabaseAdmin } = require('../config/supabase');

exports.checkIn = async (req, res) => {
  try {
    const eventId = Number(req.body?.event_id);
    const userId = Number(req.body?.user_id);
    const qrCode = req.body?.qr_code;

    let registration = null;

    if (qrCode) {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('qr_code', qrCode)
        .single();
      if (error) return res.status(404).json({ success: false, message: 'Invalid QR code.' });
      registration = data;
    } else {
      if (!eventId || !userId) {
        return res.status(400).json({ success: false, message: 'event_id and user_id or qr_code are required.' });
      }
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
      if (error) return res.status(404).json({ success: false, message: 'Registration not found.' });
      registration = data;
    }

    const payload = {
      event_id: registration.event_id,
      user_id: registration.user_id,
      registration_id: registration.id,
      checked_in_at: new Date().toISOString()
    };

    const { data: created, error: createError } = await supabaseAdmin
      .from('attendance')
      .insert(payload)
      .select('*')
      .single();

    if (createError && String(createError.message || '').toLowerCase().includes('duplicate')) {
      return res.status(409).json({ success: false, message: 'User already checked in.' });
    }
    if (createError) throw createError;

    return res.status(201).json({ success: true, attendance: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Check-in failed.' });
  }
};

exports.getEventAttendance = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, users(name, email, username)')
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, attendance: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event attendance.' });
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, events(*)')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, attendance: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch user attendance.' });
  }
};

exports.simulateQRScan = async (req, res) => {
  req.body = { qr_code: req.body?.qr_code };
  return exports.checkIn(req, res);
};
