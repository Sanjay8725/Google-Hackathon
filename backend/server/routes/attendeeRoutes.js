const express = require('express');
const controller = require('../controllers/attendeeController');

const router = express.Router();

router.get('/:userId/schedule', controller.getMySchedule);
router.get('/:userId/event/:eventId', controller.getEventDetails);
router.get('/:userId/qrcode/:eventId', controller.getQRCode);
router.get('/:userId/feedback', controller.getMyFeedback);
router.post('/:userId/feedback/:eventId', controller.submitFeedbackToEvent);
router.get('/:userId/notifications', controller.getNotifications);
router.get('/:userId/certificate/:eventId', controller.getCertificate);

module.exports = router;
