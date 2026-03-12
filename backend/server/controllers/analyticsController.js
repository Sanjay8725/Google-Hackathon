const db = require('../config/database');

// Get comprehensive event analytics
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event details
    const [event] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);

    if (event.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Calculate attendance rate
    const attendanceRate = event[0].capacity > 0 
      ? ((event[0].checked_in / event[0].capacity) * 100).toFixed(1)
      : 0;

    // Get check-in timeline (hourly breakdown)
    const [timeline] = await db.query(`
      SELECT 
        DATE_FORMAT(check_in_time, '%H:00') as hour,
        COUNT(*) as count
      FROM attendance 
      WHERE event_id = ? 
      GROUP BY hour 
      ORDER BY hour
    `, [eventId]);

    // Get feedback distribution
    const [feedbackDist] = await db.query(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM feedback 
      WHERE event_id = ? 
      GROUP BY rating 
      ORDER BY rating DESC
    `, [eventId]);

    // Get top engaged users (based on engagement logs)
    const [topUsers] = await db.query(`
      SELECT 
        u.name,
        COUNT(el.id) as actions
      FROM engagement_logs el
      JOIN users u ON el.user_id = u.id
      WHERE el.event_id = ?
      GROUP BY el.user_id
      ORDER BY actions DESC
      LIMIT 10
    `, [eventId]);

    const analytics = {
      event: event[0],
      metrics: {
        totalRegistered: event[0].registered,
        totalCheckedIn: event[0].checked_in,
        attendanceRate: parseFloat(attendanceRate),
        engagement: event[0].engagement,
        avgRating: parseFloat(event[0].avg_rating),
        totalFeedback: event[0].feedback_count,
        qrScans: event[0].qr_scans,
        capacity: event[0].capacity,
        capacityUtilization: event[0].capacity > 0 
          ? ((event[0].registered / event[0].capacity) * 100).toFixed(1)
          : 0
      },
      timeline,
      feedbackDistribution: feedbackDist,
      topEngagedUsers: topUsers
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    });
  }
};

// Get organizer dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { organizerId } = req.params;

    // Get total events
    const [totalEvents] = await db.query(
      'SELECT COUNT(*) as count FROM events WHERE organizer_id = ?',
      [organizerId]
    );

    // Get total attendees (unique)
    const [totalAttendees] = await db.query(`
      SELECT COUNT(DISTINCT r.user_id) as count 
      FROM registrations r 
      JOIN events e ON r.event_id = e.id 
      WHERE e.organizer_id = ?
    `, [organizerId]);

    // Get total revenue (assuming average ticket price)
    const [revenue] = await db.query(`
      SELECT SUM(registered * 50) as total 
      FROM events 
      WHERE organizer_id = ?
    `, [organizerId]);

    // Get average rating across all events
    const [avgRating] = await db.query(
      'SELECT AVG(avg_rating) as rating FROM events WHERE organizer_id = ?',
      [organizerId]
    );

    // Get recent events
    const [recentEvents] = await db.query(
      'SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC LIMIT 5',
      [organizerId]
    );

    // Get events by status
    const [statusBreakdown] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM events 
      WHERE organizer_id = ?
      GROUP BY status
    `, [organizerId]);

    // Get monthly trend (registrations per month)
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(e.date, '%Y-%m') as month,
        SUM(e.registered) as registrations
      FROM events e
      WHERE e.organizer_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `, [organizerId]);

    const dashboardStats = {
      summary: {
        totalEvents: totalEvents[0].count,
        totalAttendees: totalAttendees[0].count,
        totalRevenue: revenue[0].total || 0,
        avgRating: parseFloat(avgRating[0].rating || 0).toFixed(2)
      },
      recentEvents,
      statusBreakdown,
      monthlyTrend
    };

    res.json({
      success: true,
      stats: dashboardStats
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard analytics' 
    });
  }
};

// Track engagement action
exports.trackEngagement = async (req, res) => {
  try {
    const { event_id, user_id, action } = req.body;

    // Insert engagement log
    await db.query(
      'INSERT INTO engagement_logs (event_id, user_id, action) VALUES (?, ?, ?)',
      [event_id, user_id, action]
    );

    // Recalculate engagement score
    const [logs] = await db.query(
      'SELECT COUNT(*) as count FROM engagement_logs WHERE event_id = ?',
      [event_id]
    );

    const [event] = await db.query(
      'SELECT registered FROM events WHERE id = ?',
      [event_id]
    );

    // Engagement = (total actions / expected actions) * 100
    // Expected actions = registered users * 5 (assumption)
    const expectedActions = event[0].registered * 5;
    const engagementScore = expectedActions > 0 
      ? Math.min(((logs[0].count / expectedActions) * 100), 100).toFixed(2)
      : 0;

    await db.query(
      'UPDATE events SET engagement = ? WHERE id = ?',
      [engagementScore, event_id]
    );

    res.json({
      success: true,
      message: 'Engagement tracked',
      engagement: parseFloat(engagementScore)
    });
  } catch (error) {
    console.error('Track engagement error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track engagement' 
    });
  }
};
