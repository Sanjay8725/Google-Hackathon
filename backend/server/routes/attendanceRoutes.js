const express = require('express');
const controller = require('../controllers/attendanceController');

const router = express.Router();

router.post('/checkin', controller.checkIn);
router.get('/event/:eventId', controller.getEventAttendance);
router.get('/user/:userId', controller.getUserAttendance);
router.post('/qr-scan', controller.simulateQRScan);

module.exports = router;
