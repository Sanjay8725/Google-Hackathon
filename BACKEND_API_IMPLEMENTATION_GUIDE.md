# Organizer Portal - Backend API Implementation Guide

Complete guide for implementing API endpoints in the backend controllers.

---

## Setup & Requirements

### Prerequisites
- Node.js and Express.js configured
- Database connected (MySQL)
- Authentication middleware active
- Controllers directory with existing files

### Dependencies
```bash
npm install express-validator dotenv cors helmet
```

---

## DATABASE CONNECTIONS

All controllers should use the database connection from `database.js`:

```javascript
const pool = require('../config/database');
```

### Query Helper Function
```javascript
// Add to database.js for cleaner queries
async function query(sql, values) {
  try {
    const [results] = await pool.query(sql, values);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

module.exports = { pool, query };
```

---

## EVENT CONTROLLER IMPLEMENTATION

### File: `backend/server/controllers/eventController.js`

```javascript
const { pool, query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// CREATE EVENT
exports.createEvent = [
  // Validation middleware
  body('title').isLength({ min: 5, max: 200 }).trim(),
  body('description').isLength({ min: 10, max: 2000 }).trim(),
  body('date').isISO8601(),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').isLength({ min: 5, max: 255 }).trim(),
  body('category').notEmpty(),
  body('venue_type').isIn(['in-person', 'virtual', 'hybrid']),
  body('capacity').isInt({ min: 1 }),
  
  async (req, res) => {
    try {
      // Check validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        title,
        description,
        date,
        start_time,
        location,
        category,
        venue_type,
        capacity
      } = req.body;

      const organizerId = req.user.id; // From authentication middleware

      // SQL INSERT
      const sql = `
        INSERT INTO events (
          organizer_id,
          title,
          description,
          date,
          start_time,
          location,
          venue_type,
          category,
          capacity,
          registration_count,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Planning', NOW())
      `;

      const result = await query(sql, [
        organizerId,
        title,
        description,
        date,
        start_time,
        location,
        venue_type,
        category,
        capacity
      ]);

      return res.status(201).json({
        success: true,
        eventId: result.insertId,
        message: 'Event created successfully',
        event: {
          id: result.insertId,
          organizer_id: organizerId,
          title,
          date,
          status: 'Planning',
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      });
    }
  }
];

// GET ORGANIZER'S EVENTS
exports.getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let sql = 'SELECT * FROM events WHERE organizer_id = ?';
    let params = [organizerId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?, ?';
    const offset = (page - 1) * limit;
    params.push(offset, parseInt(limit));

    const events = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM events WHERE organizer_id = ?';
    let countParams = [organizerId];
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await query(countSql, countParams);

    return res.json({
      success: true,
      events,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// GET EVENT DETAILS
exports.getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const sql = `
      SELECT e.*,
        COUNT(DISTINCT r.id) as registered,
        SUM(CASE WHEN r.attended = 1 THEN 1 ELSE 0 END) as checked_in,
        SUM(CASE WHEN r.attended = 0 THEN 1 ELSE 0 END) as no_show
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ? AND e.organizer_id = ?
      GROUP BY e.id
    `;

    const results = await query(sql, [eventId, organizerId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = results[0];

    // Calculate analytics
    const analyticsSql = `
      SELECT
        AVG(r.rating) as avg_rating,
        COUNT(DISTINCT fb.id) as feedback_count
      FROM registrations r
      LEFT JOIN feedback fb ON r.id = fb.registration_id
      WHERE r.event_id = ?
    `;

    const analyticsResults = await query(analyticsSql, [eventId]);
    const analytics = analyticsResults[0];

    event.avg_rating = analytics.avg_rating || 0;
    event.feedback_count = analytics.feedback_count || 0;

    return res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// UPDATE EVENT
exports.updateEvent = [
  body('title').optional().isLength({ min: 5, max: 200 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['Planning', 'Upcoming', 'Live', 'Completed', 'Cancelled']),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, details: errors.array() });
      }

      const { eventId } = req.params;
      const organizerId = req.user.id;
      const updates = req.body;

      // Build dynamic UPDATE query
      const updateFields = [];
      const updateValues = [];

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updateValues.push(eventId, organizerId);

      const sql = `
        UPDATE events
        SET ${updateFields.join(', ')}
        WHERE id = ? AND organizer_id = ?
      `;

      const result = await query(sql, updateValues);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found or unauthorized'
        });
      }

      return res.json({
        success: true,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
];

// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const sql = 'DELETE FROM events WHERE id = ? AND organizer_id = ?';
    const result = await query(sql, [eventId, organizerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or unauthorized'
      });
    }

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## ATTENDANCE CONTROLLER UPDATES

### File: `backend/server/controllers/attendanceController.js`

```javascript
const { pool, query } = require('../config/database');

// REGISTER ATTENDEE
exports.registerAttendee = [
  body('user_id').isInt(),
  body('ticket_type').notEmpty().isLength({ min: 2, max: 50 }),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, details: errors.array() });
      }

      const { eventId } = req.params;
      const { user_id, ticket_type } = req.body;
      const organizerId = req.user.id;

      // Check if event exists and belongs to organizer
      const eventCheck = await query(
        'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
        [eventId, organizerId]
      );

      if (eventCheck.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Check if already registered
      const registrationCheck = await query(
        'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
        [eventId, user_id]
      );

      if (registrationCheck.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'User already registered for this event'
        });
      }

      // Check event capacity
      const capacityCheck = await query(
        `SELECT capacity, (SELECT COUNT(*) FROM registrations WHERE event_id = ?) as registered
         FROM events WHERE id = ?`,
        [eventId, eventId]
      );

      if (capacityCheck[0].registered >= capacityCheck[0].capacity) {
        return res.status(400).json({
          success: false,
          error: 'Event capacity full'
        });
      }

      // Generate QR code
      const qrCode = `EVENT${eventId}_USER${user_id}_${Date.now()}`;

      // Register attendee
      const sql = `
        INSERT INTO registrations (
          event_id,
          user_id,
          ticket_type,
          registration_date,
          payment_status,
          qr_code,
          attended
        ) VALUES (?, ?, ?, NOW(), 'completed', ?, 0)
      `;

      const result = await query(sql, [eventId, user_id, ticket_type, qrCode]);

      return res.status(201).json({
        success: true,
        registrationId: result.insertId,
        message: 'Attendee registered successfully',
        registration: {
          id: result.insertId,
          event_id: eventId,
          user_id,
          ticket_type,
          registration_date: new Date(),
          payment_status: 'completed',
          qr_code: qrCode
        }
      });
    } catch (error) {
      console.error('Error registering attendee:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
];

// GET EVENT REGISTRATIONS
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify event ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const sql = `
      SELECT
        r.id,
        r.user_id,
        u.username as user_name,
        u.email as user_email,
        r.ticket_type,
        r.registration_date,
        r.payment_status,
        r.attended,
        r.check_in_time
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `;

    const registrations = await query(sql, [eventId]);

    return res.json({
      success: true,
      registrations,
      total: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// CHECK-IN ATTENDEE
exports.checkInAttendee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { qr_code } = req.body;

    const sql = `
      UPDATE registrations
      SET attended = 1, check_in_time = NOW()
      WHERE event_id = ? AND qr_code = ?
    `;

    const result = await query(sql, [eventId, qr_code]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found or invalid'
      });
    }

    // Get attendee info
    const attendeeInfo = await query(
      `SELECT u.id, u.username FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ? AND r.qr_code = ?`,
      [eventId, qr_code]
    );

    return res.json({
      success: true,
      message: 'Attendee checked in',
      attendee: {
        user_id: attendeeInfo[0].id,
        user_name: attendeeInfo[0].username,
        check_in_time: new Date()
      }
    });
  } catch (error) {
    console.error('Error checking in attendee:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## EXPENSE CONTROLLER IMPLEMENTATION

### File: `backend/server/controllers/expenseController.js`

```javascript
const { pool, query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// ADD EXPENSE
exports.addExpense = [
  body('title').isLength({ min: 3, max: 200 }).trim(),
  body('category').notEmpty(),
  body('amount').isDecimal({ force_decimal: true }).custom(val => val > 0),
  body('expense_date').isISO8601(),
  body('payment_method').notEmpty(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { eventId } = req.params;
      const organizerId = req.user.id;
      const { title, category, amount, expense_date, payment_method, notes } = req.body;

      // Verify event ownership
      const eventCheck = await query(
        'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
        [eventId, organizerId]
      );

      if (eventCheck.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      const sql = `
        INSERT INTO event_expenses (
          event_id,
          title,
          category,
          amount,
          expense_date,
          payment_method,
          notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await query(sql, [
        eventId,
        title,
        category,
        amount,
        expense_date,
        payment_method,
        notes || null
      ]);

      return res.status(201).json({
        success: true,
        expenseId: result.insertId,
        message: 'Expense added successfully',
        expense: {
          id: result.insertId,
          event_id: eventId,
          title,
          category,
          amount,
          expense_date,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
];

// GET EVENT EXPENSES
exports.getEventExpenses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;
    const { category, start_date, end_date } = req.query;

    // Verify event ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    let sql = 'SELECT * FROM event_expenses WHERE event_id = ?';
    let params = [eventId];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (start_date) {
      sql += ' AND expense_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND expense_date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY expense_date DESC';

    const expenses = await query(sql, params);

    // Calculate total
    const totalSql = `
      SELECT SUM(amount) as total_expenses
      FROM event_expenses
      WHERE event_id = ?
    `;

    const totalResult = await query(totalSql, [eventId]);

    return res.json({
      success: true,
      expenses,
      total_expenses: totalResult[0].total_expenses || 0,
      expense_count: expenses.length
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// UPDATE EXPENSE
exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const organizerId = req.user.id;
    const updates = req.body;

    // Verify ownership
    const expenseCheck = await query(
      `SELECT e.id FROM event_expenses e
       JOIN events ev ON e.event_id = ev.id
       WHERE e.id = ? AND ev.organizer_id = ?`,
      [expenseId, organizerId]
    );

    if (expenseCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateValues.push(expenseId);

    const sql = `
      UPDATE event_expenses
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await query(sql, updateValues);

    return res.json({
      success: true,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE EXPENSE
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const organizerId = req.user.id;

    // Verify ownership
    const expenseCheck = await query(
      `SELECT e.id FROM event_expenses e
       JOIN events ev ON e.event_id = ev.id
       WHERE e.id = ? AND ev.organizer_id = ?`,
      [expenseId, organizerId]
    );

    if (expenseCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found'
      });
    }

    const sql = 'DELETE FROM event_expenses WHERE id = ?';
    await query(sql, [expenseId]);

    return res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## VENDOR CONTROLLER IMPLEMENTATION

### File: `backend/server/controllers/vendorController.js`

```javascript
const { pool, query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// ADD VENDOR
exports.addVendor = [
  body('vendor_name').isLength({ min: 3, max: 200 }).trim(),
  body('vendor_contact').notEmpty().trim(),
  body('vendor_email').isEmail(),
  body('vendor_phone').notEmpty().trim(),
  body('vendor_category').notEmpty().trim(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { eventId } = req.params;
      const organizerId = req.user.id;
      const {
        vendor_name,
        vendor_contact,
        vendor_email,
        vendor_phone,
        vendor_category,
        booth_location,
        booth_fee,
        notes
      } = req.body;

      // Verify event ownership
      const eventCheck = await query(
        'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
        [eventId, organizerId]
      );

      if (eventCheck.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      const sql = `
        INSERT INTO event_vendors (
          event_id,
          vendor_name,
          vendor_contact,
          vendor_email,
          vendor_phone,
          booth_location,
          vendor_category,
          booth_fee,
          payment_status,
          notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
      `;

      const result = await query(sql, [
        eventId,
        vendor_name,
        vendor_contact,
        vendor_email,
        vendor_phone,
        booth_location || null,
        vendor_category,
        booth_fee || null,
        notes || null
      ]);

      return res.status(201).json({
        success: true,
        vendorId: result.insertId,
        message: 'Vendor added successfully',
        vendor: {
          id: result.insertId,
          event_id: eventId,
          vendor_name,
          vendor_email,
          booth_fee,
          payment_status: 'pending',
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error adding vendor:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
];

// GET EVENT VENDORS
exports.getEventVendors = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify event ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const sql = `
      SELECT *
      FROM event_vendors
      WHERE event_id = ?
      ORDER BY created_at DESC
    `;

    const vendors = await query(sql, [eventId]);

    return res.json({
      success: true,
      vendors,
      total: vendors.length
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// UPDATE VENDOR
exports.updateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const organizerId = req.user.id;
    const updates = req.body;

    // Verify ownership
    const vendorCheck = await query(
      `SELECT v.id FROM event_vendors v
       JOIN events e ON v.event_id = e.id
       WHERE v.id = ? AND e.organizer_id = ?`,
      [vendorId, organizerId]
    );

    if (vendorCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateValues.push(vendorId);

    const sql = `
      UPDATE event_vendors
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await query(sql, updateValues);

    return res.json({
      success: true,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE VENDOR
exports.deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const organizerId = req.user.id;

    // Verify ownership
    const vendorCheck = await query(
      `SELECT v.id FROM event_vendors v
       JOIN events e ON v.event_id = e.id
       WHERE v.id = ? AND e.organizer_id = ?`,
      [vendorId, organizerId]
    );

    if (vendorCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const sql = 'DELETE FROM event_vendors WHERE id = ?';
    await query(sql, [vendorId]);

    return res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## ANALYTICS CONTROLLER UPDATES

### File: `backend/server/controllers/analyticsController.js`

```javascript
const { pool, query } = require('../config/database');

// GET DASHBOARD ANALYTICS
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const sql = `
      SELECT
        COUNT(DISTINCT e.id) as total_events,
        SUM(CASE WHEN e.status = 'Live' THEN 1 ELSE 0 END) as active_events,
        SUM(CASE WHEN e.date = CURDATE() THEN 1 ELSE 0 END) as events_today,
        COUNT(DISTINCT r.id) as total_attendees,
        COALESCE(SUM(ee.amount), 0) as total_expenses,
        COALESCE(SUM(ev.booth_fee), 0) as total_revenue
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN event_expenses ee ON e.id = ee.event_id
      LEFT JOIN event_vendors ev ON e.id = ev.event_id
      WHERE e.organizer_id = ?
    `;

    const results = await query(sql, [organizerId]);

    return res.json({
      success: true,
      dashboard: results[0]
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET EVENT ANALYTICS
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const sql = `
      SELECT
        COUNT(DISTINCT r.id) as total_registrations,
        SUM(CASE WHEN r.attended = 1 THEN 1 ELSE 0 END) as check_ins,
        SUM(CASE WHEN r.attended = 0 THEN 1 ELSE 0 END) as no_shows,
        COALESCE(AVG(f.rating), 0) as average_rating,
        COUNT(DISTINCT f.id) as feedback_count,
        COALESCE(SUM(ev.booth_fee), 0) as revenue_generated,
        COALESCE(SUM(ee.amount), 0) as total_expenses
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      LEFT JOIN feedback f ON r.id = f.registration_id
      LEFT JOIN event_vendors ev ON e.id = ev.event_id
      LEFT JOIN event_expenses ee ON e.id = ee.event_id
      WHERE e.id = ?
    `;

    const results = await query(sql, [eventId]);
    const analytics = results[0];

    // Calculate profit
    analytics.profit = analytics.revenue_generated - analytics.total_expenses;

    // Calculate engagement score (0-100)
    let engagementScore = 0;
    if (analytics.total_registrations > 0) {
      const checkInRate = (analytics.check_ins / analytics.total_registrations) * 100;
      const feedbackRate = (analytics.feedback_count / analytics.total_registrations) * 100;
      engagementScore = (checkInRate + feedbackRate) / 2;
    }

    analytics.engagement_score = engagementScore;

    return res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET ENGAGEMENT METRICS
exports.getEngagementMetrics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify ownership
    const eventCheck = await query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const sql = `
      SELECT
        (SUM(CASE WHEN r.attended = 1 THEN 1 ELSE 0 END) / COUNT(r.id) * 100) as session_attendance,
        (COUNT(DISTINCT f.id) / COUNT(DISTINCT r.id) * 100) as feedback_submission
      FROM registrations r
      LEFT JOIN feedback f ON r.id = f.registration_id
      WHERE r.event_id = ?
    `;

    const results = await query(sql, [eventId]);

    return res.json({
      success: true,
      engagement: results[0]
    });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

---

## ORGANIZER PROFILE CONTROLLER

### File: `backend/server/controllers/organizerController.js`

```javascript
const { pool, query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// GET ORGANIZER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT
        u.id as user_id,
        u.username as name,
        op.*,
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT r.id) as total_attendees
      FROM users u
      LEFT JOIN organizer_profiles op ON u.id = op.organizer_id
      LEFT JOIN events e ON u.id = e.organizer_id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE u.id = ? AND u.role = 'organizer'
      GROUP BY u.id
    `;

    const results = await query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Organizer profile not found'
      });
    }

    return res.json({
      success: true,
      organizer: results[0]
    });
  } catch (error) {
    console.error('Error fetching organizer profile:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// UPDATE ORGANIZER PROFILE
exports.updateProfile = [
  body('organization_name').optional().isLength({ min: 3, max: 200 }),
  body('contact_phone').optional().matches(/^[\d\-\+\s\(\)]+$/),
  body('website').optional().isURL(),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.id;
      const updates = req.body;

      // Check if profile exists
      const profileCheck = await query(
        'SELECT id FROM organizer_profiles WHERE organizer_id = ?',
        [userId]
      );

      let sql;
      let params;

      if (profileCheck.length > 0) {
        // UPDATE
        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
          }
        }

        if (updateFields.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No fields to update'
          });
        }

        updateValues.push(userId);
        sql = `UPDATE organizer_profiles SET ${updateFields.join(', ')} WHERE organizer_id = ?`;
        params = updateValues;
      } else {
        // INSERT
        const fields = ['organizer_id', ...Object.keys(updates)];
        const placeholders = Array(fields.length).fill('?');
        sql = `INSERT INTO organizer_profiles (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        params = [userId, ...Object.values(updates)];
      }

      await query(sql, params);

      return res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating organizer profile:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
];
```

---

## ROUTE SETUP

### Update: `backend/server/routes/eventRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth'); // Ensure middleware exists

// All routes require authentication
router.use(authMiddleware);

// Event CRUD
router.post('/', eventController.createEvent);
router.get('/', eventController.getOrganizerEvents);
router.get('/:eventId', eventController.getEventDetails);
router.put('/:eventId', eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

module.exports = router;
```

### Create: `backend/server/routes/vendorRoutes.js`
```javascript
const express = require('express');
const router = express.Router({ mergeParams: true });
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', vendorController.addVendor);
router.get('/', vendorController.getEventVendors);
router.put('/:vendorId', vendorController.updateVendor);
router.delete('/:vendorId', vendorController.deleteVendor);

module.exports = router;
```

### Create: `backend/server/routes/expenseRoutes.js`
```javascript
const express = require('express');
const router = express.Router({ mergeParams: true });
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getEventExpenses);
router.put('/:expenseId', expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;
```

### Update: `backend/server/server.js`
```javascript
const eventRoutes = require('./routes/eventRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Routes setup
app.use('/api/events', eventRoutes);
app.use('/api/events/:eventId/vendors', vendorRoutes);
app.use('/api/events/:eventId/expenses', expenseRoutes);
app.use('/api/events/:eventId/registrations', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Create utility function in database.js
- [ ] Implement eventController.js (all functions)
- [ ] Update attendanceController.js with new functions
- [ ] Create expenseController.js (all functions)
- [ ] Create vendorController.js (all functions)
- [ ] Update analyticsController.js
- [ ] Create organizerController.js
- [ ] Create/update all route files
- [ ] Update server.js with all routes
- [ ] Test all endpoints with Postman or curl
- [ ] Add error logging middleware
- [ ] Add request validation middleware
- [ ] Test with frontend forms
- [ ] Verify database constraints
- [ ] Add transaction support for related operations

---

