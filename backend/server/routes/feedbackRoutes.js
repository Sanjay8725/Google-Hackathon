const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST /api/feedback - Submit feedback
router.post('/', feedbackController.submitFeedback);

// GET /api/feedback/event/:eventId - Get event feedback
router.get('/event/:eventId', feedbackController.getEventFeedback);

// GET /api/feedback/stats/:eventId - Get feedback statistics
router.get('/stats/:eventId', feedbackController.getFeedbackStats);

module.exports = router;
