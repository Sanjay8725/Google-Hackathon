const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');

// GET /api/attendee/:userId/schedule
router.get('/:userId/schedule', attendeeController.getMySchedule);

// GET /api/attendee/:userId/notifications
router.get('/:userId/notifications', attendeeController.getNotifications);

// GET /api/attendee/:userId/event/:eventId
router.get('/:userId/event/:eventId', attendeeController.getEventDetails);

// GET /api/attendee/:userId/qrcode/:eventId
router.get('/:userId/qrcode/:eventId', attendeeController.getQRCode);

// GET /api/attendee/:userId/feedback
router.get('/:userId/feedback', attendeeController.getMyFeedback);

// POST /api/attendee/:userId/feedback/:eventId
router.post('/:userId/feedback/:eventId', attendeeController.submitFeedback);

// GET /api/attendee/:userId/certificate/:eventId
router.get('/:userId/certificate/:eventId', attendeeController.getCertificate);

module.exports = router;
