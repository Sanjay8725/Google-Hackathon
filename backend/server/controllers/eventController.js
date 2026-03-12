const db = require('../config/database');

let expenseTableEnsured = false;

async function ensureExpenseTable() {
  if (expenseTableEnsured) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS event_expenses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      amount DECIMAL(10,2) NOT NULL,
      expense_date DATE NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'Other',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event (event_id),
      INDEX idx_expense_date (expense_date)
    )
  `);

  expenseTableEnsured = true;
}

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, u.name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      ORDER BY e.date DESC
    `);

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
};

// Get single event
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(`
      SELECT e.*, u.name as organizer_name 
      FROM events e 
      JOIN users u ON e.organizer_id = u.id 
      WHERE e.id = ?
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      event: events[0]
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event' 
    });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { 
      organizer_id, title, description, date, time, 
      location, capacity, category, image_url 
    } = req.body;

    const normalizedCategory = String(category || '').trim();

    // Validation
    if (!organizer_id || !title || !date || !normalizedCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide required fields including event category' 
      });
    }

    const [organizerRows] = await db.query(
      'SELECT id, role FROM users WHERE id = ? LIMIT 1',
      [organizer_id]
    );

    if (organizerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organizer account not found'
      });
    }

    if (!['organizer', 'admin'].includes(String(organizerRows[0].role || '').toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Only organizer or admin accounts can create events'
      });
    }

    const [result] = await db.query(`
      INSERT INTO events 
      (organizer_id, title, description, date, time, location, capacity, category, image_url, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Planning')
    `, [organizer_id, title, description, date, time, location, capacity || 0, normalizedCategory, image_url]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: result.insertId,
        organizer_id,
        title,
        description,
        date,
        time,
        location,
        capacity,
        category: normalizedCategory,
        status: 'Planning'
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create event' 
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(id);

    await db.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update event' 
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM events WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete event' 
    });
  }
};

// Get events by organizer
exports.getEventsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const [events] = await db.query(
      'SELECT * FROM events WHERE organizer_id = ? ORDER BY date DESC',
      [organizerId]
    );

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
};

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, ticket_type } = req.body;

    // Check if already registered
    const [existing] = await db.query(
      'SELECT id FROM registrations WHERE event_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered for this event' 
      });
    }

    // Generate QR code (simplified - just a unique string)
    const qr_code = `QR-${id}-${user_id}-${Date.now()}`;

    // Insert registration
    await db.query(
      'INSERT INTO registrations (event_id, user_id, ticket_type, qr_code) VALUES (?, ?, ?, ?)',
      [id, user_id, ticket_type || 'General', qr_code]
    );

    // Update event registered count
    await db.query(
      'UPDATE events SET registered = registered + 1 WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Registration successful',
      qr_code
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
};

// Get event registrations
exports.getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;

    const [registrations] = await db.query(`
      SELECT r.*, u.name, u.email 
      FROM registrations r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.event_id = ?
    `, [id]);

    res.json({
      success: true,
      registrations
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch registrations' 
    });
  }
};

// Get expense tracker data for an event
exports.getEventExpenses = async (req, res) => {
  try {
    const { id } = req.params;

    await ensureExpenseTable();

    const [events] = await db.query(
      'SELECT id, organizer_id, title, cost FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const [expenses] = await db.query(
      'SELECT * FROM event_expenses WHERE event_id = ? ORDER BY expense_date DESC, id DESC',
      [id]
    );

    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const budget = Number(events[0].cost || 0);

    res.json({
      success: true,
      event: events[0],
      summary: {
        total_expenses: Number(totalExpenses.toFixed(2)),
        budget,
        remaining_budget: Number((budget - totalExpenses).toFixed(2)),
        expense_count: expenses.length
      },
      expenses
    });
  } catch (error) {
    console.error('Get event expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event expenses'
    });
  }
};

// Add an expense entry for an event
exports.addEventExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      organizer_id,
      title,
      category,
      amount,
      expense_date,
      payment_method,
      notes
    } = req.body;

    if (!organizer_id || !title || !amount || !expense_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organizer_id, title, amount and expense_date'
      });
    }

    await ensureExpenseTable();

    const [events] = await db.query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [id, organizer_id]
    );

    if (events.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only add expenses to your own events'
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number greater than 0'
      });
    }

    const [result] = await db.query(
      `INSERT INTO event_expenses
      (event_id, title, category, amount, expense_date, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        category || 'General',
        numericAmount,
        expense_date,
        payment_method || 'Other',
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: {
        id: result.insertId,
        event_id: Number(id),
        title,
        category: category || 'General',
        amount: numericAmount,
        expense_date,
        payment_method: payment_method || 'Other',
        notes: notes || null
      }
    });
  } catch (error) {
    console.error('Add event expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add event expense'
    });
  }
};

// Delete an expense entry for an event
exports.deleteEventExpense = async (req, res) => {
  try {
    const { id, expenseId } = req.params;
    const organizerId = Number(req.body.organizer_id || req.query.organizer_id);

    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: 'organizer_id is required'
      });
    }

    await ensureExpenseTable();

    const [events] = await db.query(
      'SELECT id FROM events WHERE id = ? AND organizer_id = ?',
      [id, organizerId]
    );

    if (events.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete expenses from your own events'
      });
    }

    const [result] = await db.query(
      'DELETE FROM event_expenses WHERE id = ? AND event_id = ?',
      [expenseId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete event expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event expense'
    });
  }
};
