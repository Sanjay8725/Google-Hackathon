const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /api/events - Get all events
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Get single event
router.get('/:id', eventController.getEventById);

// POST /api/events - Create new event
router.post('/', eventController.createEvent);

// PUT /api/events/:id - Update event
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', eventController.deleteEvent);

// GET /api/events/organizer/:organizerId - Get events by organizer
router.get('/organizer/:organizerId', eventController.getEventsByOrganizer);

// POST /api/events/:id/register - Register for event
router.post('/:id/register', eventController.registerForEvent);

// GET /api/events/:id/registrations - Get event registrations
router.get('/:id/registrations', eventController.getEventRegistrations);

// GET /api/events/:id/expenses - Get event expense tracker data
router.get('/:id/expenses', eventController.getEventExpenses);

// POST /api/events/:id/expenses - Add expense entry for event
router.post('/:id/expenses', eventController.addEventExpense);

// DELETE /api/events/:id/expenses/:expenseId - Delete expense entry for event
router.delete('/:id/expenses/:expenseId', eventController.deleteEventExpense);

module.exports = router;
