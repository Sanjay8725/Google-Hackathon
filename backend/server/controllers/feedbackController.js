const db = require('../config/database');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { event_id, user_id, rating, comment } = req.body;

    // Validation
    if (!event_id || !user_id || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide required fields' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if feedback already exists
    const [existing] = await db.query(
      'SELECT id FROM feedback WHERE event_id = ? AND user_id = ?',
      [event_id, user_id]
    );

    if (existing.length > 0) {
      // Update existing feedback
      await db.query(
        'UPDATE feedback SET rating = ?, comment = ? WHERE id = ?',
        [rating, comment, existing[0].id]
      );
    } else {
      // Insert new feedback
      await db.query(
        'INSERT INTO feedback (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [event_id, user_id, rating, comment]
      );

      // Update event feedback count
      await db.query(
        'UPDATE events SET feedback_count = feedback_count + 1 WHERE id = ?',
        [event_id]
      );
    }

    // Recalculate average rating
    const [stats] = await db.query(
      'SELECT AVG(rating) as avg_rating FROM feedback WHERE event_id = ?',
      [event_id]
    );

    await db.query(
      'UPDATE events SET avg_rating = ? WHERE id = ?',
      [stats[0].avg_rating, event_id]
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback' 
    });
  }
};

// Get event feedback
exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [feedback] = await db.query(`
      SELECT f.*, u.name 
      FROM feedback f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.event_id = ? 
      ORDER BY f.submitted_at DESC
    `, [eventId]);

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedback' 
    });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM feedback 
      WHERE event_id = ?
    `, [eventId]);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedback statistics' 
    });
  }
};
