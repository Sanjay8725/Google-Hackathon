const db = require('../config/database');

const EDUCATIONAL_EVENT_KEYS = new Set([
  'educational',
  'workshop',
  'workshops',
  'seminar',
  'seminars',
  'training program',
  'training programs',
  'training',
  'hackathon',
  'hackathons',
  'academic conference',
  'academic conferences'
]);

function isEducationalEvent(category, subCategory) {
  const categoryValue = String(category || '').trim().toLowerCase();
  const subCategoryValue = String(subCategory || '').trim().toLowerCase();
  return EDUCATIONAL_EVENT_KEYS.has(categoryValue) || EDUCATIONAL_EVENT_KEYS.has(subCategoryValue);
}

async function isCertificateTemplateEnabled() {
  try {
    if (!(typeof db.isSupabase === 'function' && db.isSupabase())) {
      await db.query(`
        CREATE TABLE IF NOT EXISTS platform_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          setting_key VARCHAR(150) NOT NULL UNIQUE,
          setting_value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }

    const [rows] = await db.query(
      'SELECT setting_value FROM platform_settings WHERE setting_key = ? LIMIT 1',
      ['certificate_templates_enabled']
    );

    if (rows.length === 0) {
      return true;
    }

    return String(rows[0].setting_value) === 'true';
  } catch (error) {
    console.warn('Certificate template setting lookup failed, defaulting to enabled:', error.message);
    return true;
  }
}

// Get attendee's registered events (schedule)
exports.getMySchedule = async (req, res) => {
  try {
    const userId = req.params.userId;

    const [events] = await db.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date,
        e.time,
        e.location,
        e.category,
        e.sub_category,
        e.status,
        e.capacity,
        e.registered,
        e.checked_in,
        e.avg_rating,
        e.feedback_count,
        u.name as organizer_name,
        r.id as registration_id,
        r.ticket_type,
        r.qr_code,
        CASE WHEN a.id IS NOT NULL THEN true ELSE false END as checked_in_status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);

    res.json({
      success: true,
      schedule: events
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
};

// Get event details with attendance info
exports.getEventDetails = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const [event] = await db.query(`
      SELECT 
        e.*,
        u.name as organizer_name,
        u.email as organizer_email,
        r.id as registration_id,
        r.ticket_type,
        r.qr_code,
        a.id as attendance_id,
        a.check_in_time,
        a.check_in_method
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      JOIN registrations r ON e.id = r.event_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE e.id = ? AND r.user_id = ?
    `, [eventId, userId]);

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: event[0]
    });
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
};

// Get QR code for event
exports.getQRCode = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const [registration] = await db.query(`
      SELECT r.qr_code, e.title, e.date, u.name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ? AND r.user_id = ?
    `, [eventId, userId]);

    if (registration.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registration found'
      });
    }

    res.json({
      success: true,
      qr_code: registration[0].qr_code,
      event_title: registration[0].title,
      event_date: registration[0].date,
      attendee_name: registration[0].name
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code'
    });
  }
};

// Get feedback for attended events
exports.getMyFeedback = async (req, res) => {
  try {
    const userId = req.params.userId;

    const [feedback] = await db.query(`
      SELECT 
        f.id,
        f.event_id,
        f.rating,
        f.comment,
        f.created_at,
        e.title as event_title,
        e.date as event_date,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END as has_feedback
      FROM events e
      JOIN registrations r ON e.id = r.event_id
      LEFT JOIN feedback f ON e.id = f.event_id AND f.user_id = ?
      WHERE r.user_id = ? AND e.status = 'Completed'
      ORDER BY e.date DESC
    `, [userId, userId]);

    res.json({
      success: true,
      feedback: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// Get contextual notifications for an attendee
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const [events] = await db.query(`
      SELECT
        e.id,
        e.title,
        e.date,
        e.time,
        e.location,
        e.status,
        r.created_at AS registered_at,
        CASE WHEN a.id IS NOT NULL THEN TRUE ELSE FALSE END AS checked_in_status,
        CASE WHEN f.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_feedback
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN feedback f ON e.id = f.event_id AND f.user_id = ?
      WHERE r.user_id = ?
      ORDER BY e.date DESC
    `, [userId, userId]);

    const notifications = [];
    const now = new Date();

    events.forEach(event => {
      const status = String(event.status || '').toLowerCase();
      const eventDateTime = new Date(`${event.date} ${event.time || '00:00:00'}`);
      const hoursUntil = isNaN(eventDateTime.getTime())
        ? Infinity
        : (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Registration confirmation
      notifications.push({
        type: 'registration_confirmation',
        title: 'Registration Confirmed',
        message: `You are registered for "${event.title}".`,
        event_id: event.id,
        timestamp: event.registered_at,
        is_read: true
      });

      // Live now
      if (status === 'live') {
        notifications.push({
          type: 'live_now',
          title: '\ud83d\udd34 Event is Live Now!',
          message: `"${event.title}" is happening right now. Prepare your QR pass for entry.`,
          event_id: event.id,
          timestamp: new Date().toISOString(),
          is_read: false
        });
      }

      // Upcoming reminder within 48 hours
      if (status === 'upcoming' && hoursUntil > 0 && hoursUntil <= 48) {
        const hours = Math.round(hoursUntil);
        notifications.push({
          type: 'event_reminder',
          title: 'Event Starting Soon',
          message: `"${event.title}" starts in approximately ${hours} hour${hours !== 1 ? 's' : ''}. Keep your QR pass ready!`,
          event_id: event.id,
          timestamp: new Date().toISOString(),
          is_read: false
        });
      }

      // Feedback reminder
      if (status === 'completed' && event.checked_in_status && !event.has_feedback) {
        notifications.push({
          type: 'feedback_reminder',
          title: 'Share Your Feedback',
          message: `You attended "${event.title}". Share your experience to help others!`,
          event_id: event.id,
          timestamp: new Date().toISOString(),
          is_read: false
        });
      }
    });

    // Unread first, then by timestamp descending
    notifications.sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    res.json({
      success: true,
      notifications,
      unread_count: notifications.filter(n => !n.is_read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Submit feedback for event
exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.params.userId;
    const eventId = req.params.eventId;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if already submitted feedback
    const [existing] = await db.query(
      'SELECT id FROM feedback WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existing.length > 0) {
      // Update existing feedback
      await db.query(
        'UPDATE feedback SET rating = ?, comment = ? WHERE event_id = ? AND user_id = ?',
        [rating, comment || '', eventId, userId]
      );
    } else {
      // Insert new feedback
      await db.query(
        'INSERT INTO feedback (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        [eventId, userId, rating, comment || '']
      );
    }

    // Update event average rating
    const [ratings] = await db.query(
      'SELECT AVG(rating) as avg_rating FROM feedback WHERE event_id = ?',
      [eventId]
    );

    const avgRating = ratings[0].avg_rating || 0;

    await db.query(
      'UPDATE events SET avg_rating = ?, feedback_count = (SELECT COUNT(*) FROM feedback WHERE event_id = ?) WHERE id = ?',
      [avgRating, eventId, eventId]
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      average_rating: parseFloat(avgRating.toFixed(2))
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// Generate certificate for attended event
exports.getCertificate = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    // Verify user attended the event
    const [attendance] = await db.query(`
      SELECT 
        a.check_in_time,
        e.title,
        e.date,
        e.status,
        e.category,
        e.sub_category,
        u.name,
        o.name as organizer_name
      FROM attendance a
      JOIN registrations r ON a.registration_id = r.id
      JOIN events e ON a.event_id = e.id
      JOIN users u ON a.user_id = u.id
      JOIN users o ON e.organizer_id = o.id
      WHERE a.event_id = ? AND a.user_id = ?
    `, [eventId, userId]);

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance record found. You must check in to get a certificate.'
      });
    }

    const record = attendance[0];

    if (String(record.status || '').toLowerCase() !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is available only after the event is completed.'
      });
    }

    if (!isEducationalEvent(record.category, record.sub_category)) {
      return res.status(403).json({
        success: false,
        message: 'Certificates are available only for educational events.'
      });
    }

    const templatesEnabled = await isCertificateTemplateEnabled();
    if (!templatesEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Certificate templates are currently disabled by admin.'
      });
    }

    res.json({
      success: true,
      certificate: {
        attendee_name: record.name,
        event_title: record.title,
        event_date: new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        check_in_time: new Date(record.check_in_time).toLocaleString(),
        organizer_name: record.organizer_name,
        category: record.category,
        certificate_number: `CERT-${eventId}-${userId}-${Date.now()}`,
        issue_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate'
    });
  }
};
