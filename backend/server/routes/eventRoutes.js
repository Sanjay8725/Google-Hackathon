const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.get('/organizer/:organizerId', eventController.getOrganizerEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerForEvent);
router.get('/:id/registrations', eventController.getEventRegistrations);
router.get('/:id/expenses', eventController.getEventExpenses);
router.post('/:id/expenses', eventController.addEventExpense);
router.delete('/:id/expenses/:expenseId', eventController.deleteEventExpense);

module.exports = router;
