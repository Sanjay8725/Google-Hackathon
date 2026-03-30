const express = require('express');
const controller = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', controller.submitFeedback);
router.get('/event/:eventId', controller.getEventFeedback);
router.get('/stats/:eventId', controller.getFeedbackStats);

module.exports = router;
