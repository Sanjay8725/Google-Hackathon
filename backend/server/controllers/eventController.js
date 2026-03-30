const { supabaseAdmin } = require('../config/supabase');

exports.getAllEvents = async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, events: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch events.' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Event not found.' });
    return res.json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event.' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const requiredFields = ['title', 'date', 'time', 'location'];
    const missing = requiredFields.filter((f) => !payload[f]);

    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    const eventData = {
      title: payload.title,
      description: payload.description || '',
      date: payload.date,
      time: payload.time,
      location: payload.location,
      capacity: Number(payload.capacity || 0),
      organizer_id: payload.organizer_id ? Number(payload.organizer_id) : null,
      status: payload.status || 'Upcoming',
      category: payload.category || null,
      venue_type: payload.venue_type || null
    };

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
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
    const id = Number(req.params.id);
    const updates = req.body || {};

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Event not found or update failed.' });
    return res.json({ success: true, event: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update event.' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);

    if (error) return res.status(404).json({ success: false, message: 'Event not found or delete failed.' });
    return res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete event.' });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const userId = Number(req.body?.user_id);
    const ticketType = req.body?.ticket_type || 'General';

    if (!eventId || !userId) {
      return res.status(400).json({ success: false, message: 'eventId and user_id are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        ticket_type: ticketType,
        qr_code: `EVT-${eventId}-USR-${userId}`
      })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, registration: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to register for event.' });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, registrations: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch registrations.' });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = Number(req.params.organizerId);
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('date', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, events: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch organizer events.' });
  }
};

exports.getEventExpenses = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { data, error } = await supabaseAdmin
      .from('event_expenses')
      .select('*')
      .eq('event_id', eventId)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    const total = (data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return res.json({ success: true, expenses: data || [], total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event expenses.' });
  }
};

exports.addEventExpense = async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const payload = req.body || {};

    const row = {
      event_id: eventId,
      organizer_id: payload.organizer_id ? Number(payload.organizer_id) : null,
      category: payload.category || 'General',
      description: payload.description || '',
      amount: Number(payload.amount || 0),
      expense_date: payload.expense_date || new Date().toISOString().slice(0, 10)
    };

    const { data, error } = await supabaseAdmin
      .from('event_expenses')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, expense: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add expense.' });
  }
};

exports.deleteEventExpense = async (req, res) => {
  try {
    const expenseId = Number(req.params.expenseId);
    const { error } = await supabaseAdmin
      .from('event_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete expense.' });
  }
};
