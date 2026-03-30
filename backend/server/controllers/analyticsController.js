const { supabaseAdmin } = require('../config/supabase');

async function getEventSummary(eventId) {
  const [{ count: registrations }, { count: attendance }, feedbackRows] = await Promise.all([
    supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
    supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
    supabaseAdmin.from('feedback').select('rating').eq('event_id', eventId)
  ]);

  const feedback = feedbackRows.data || [];
  const avgRating = feedback.length
    ? feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length
    : 0;

  return {
    registrations: registrations || 0,
    attendance: attendance || 0,
    checkInRate: registrations ? Number((((attendance || 0) / registrations) * 100).toFixed(2)) : 0,
    averageRating: Number(avgRating.toFixed(2)),
    feedbackCount: feedback.length
  };
}

exports.getEventAnalytics = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const summary = await getEventSummary(eventId);
    return res.json({ success: true, analytics: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event analytics.' });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const organizerId = Number(req.params.organizerId);
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, title, date, status')
      .eq('organizer_id', organizerId)
      .order('date', { ascending: true });

    if (error) throw error;

    const eventMetrics = await Promise.all((events || []).map(async (event) => ({
      ...event,
      ...(await getEventSummary(event.id))
    })));

    return res.json({ success: true, dashboard: { organizerId, events: eventMetrics } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard analytics.' });
  }
};

exports.trackEngagement = async (req, res) => {
  try {
    const payload = req.body || {};
    const row = {
      user_id: payload.user_id ? Number(payload.user_id) : null,
      event_id: payload.event_id ? Number(payload.event_id) : null,
      action: payload.action || 'unknown_action',
      metadata: payload.metadata || {},
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('engagement_logs')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, log: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to track engagement.' });
  }
};
