const { supabaseAdmin } = require('../config/supabase');

exports.submitFeedback = async (req, res) => {
  try {
    const payload = req.body || {};
    const row = {
      event_id: Number(payload.event_id),
      user_id: Number(payload.user_id),
      rating: Number(payload.rating),
      comment: payload.comment || ''
    };

    if (!row.event_id || !row.user_id || !row.rating) {
      return res.status(400).json({ success: false, message: 'event_id, user_id, and rating are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('feedback')
      .upsert(row, { onConflict: 'event_id,user_id' })
      .select('*')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, feedback: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit feedback.' });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('*, users(name, username)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, feedback: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch event feedback.' });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { data, error } = await supabaseAdmin
      .from('feedback')
      .select('rating')
      .eq('event_id', eventId);

    if (error) throw error;

    const total = (data || []).length;
    const average = total ? (data.reduce((s, x) => s + Number(x.rating || 0), 0) / total) : 0;

    return res.json({
      success: true,
      stats: {
        total,
        averageRating: Number(average.toFixed(2)),
        distribution: [1, 2, 3, 4, 5].reduce((acc, star) => {
          acc[star] = (data || []).filter((d) => Number(d.rating) === star).length;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch feedback stats.' });
  }
};
