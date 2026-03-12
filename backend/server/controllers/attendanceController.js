const db = require('../config/database');

// Check-in with QR code
exports.checkIn = async (req, res) => {
  try {
    const { event_id, user_id, qr_code, check_in_method } = req.body;

    // Verify registration
    const [registration] = await db.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ? AND qr_code = ?',
      [event_id, user_id, qr_code]
    );

    if (registration.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    // Check if already checked in
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE event_id = ? AND user_id = ?',
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already checked in' 
      });
    }

    // Insert attendance record
    await db.query(
      'INSERT INTO attendance (registration_id, event_id, user_id, check_in_method) VALUES (?, ?, ?, ?)',
      [registration[0].id, event_id, user_id, check_in_method || 'QR']
    );

    // Update event stats
    await db.query(
      'UPDATE events SET checked_in = checked_in + 1, qr_scans = qr_scans + 1 WHERE id = ?',
      [event_id]
    );

    res.json({
      success: true,
      message: 'Check-in successful'
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Check-in failed' 
    });
  }
};

// Get event attendance
exports.getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [attendance] = await db.query(`
      SELECT a.*, u.name, u.email 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.event_id = ? 
      ORDER BY a.check_in_time DESC
    `, [eventId]);

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance' 
    });
  }
};

// Get user attendance history
exports.getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;

    const [attendance] = await db.query(`
      SELECT a.*, e.title, e.date, e.location 
      FROM attendance a 
      JOIN events e ON a.event_id = e.id 
      WHERE a.user_id = ? 
      ORDER BY a.check_in_time DESC
    `, [userId]);

    res.json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Get user attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance' 
    });
  }
};

// Simulate QR scan
exports.simulateQRScan = async (req, res) => {
  try {
    const { qr_code } = req.body;

    // Parse QR code to extract event_id and user_id
    const parts = qr_code.split('-');
    const event_id = parts[1];
    const user_id = parts[2];

    // Get registration
    const [registration] = await db.query(
      'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
      [event_id, user_id]
    );

    if (registration.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid QR code' 
      });
    }

    // Check if already checked in
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE event_id = ? AND user_id = ?',
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already checked in',
        attendance: existing[0]
      });
    }

    res.json({
      success: true,
      message: 'QR code valid',
      registration: registration[0]
    });
  } catch (error) {
    console.error('Simulate QR scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'QR scan failed' 
    });
  }
};
