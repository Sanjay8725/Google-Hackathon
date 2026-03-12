const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// POST /api/attendance/checkin - QR code check-in
router.post('/checkin', attendanceController.checkIn);

// GET /api/attendance/event/:eventId - Get attendance for event
router.get('/event/:eventId', attendanceController.getEventAttendance);

// GET /api/attendance/user/:userId - Get user's attendance history
router.get('/user/:userId', attendanceController.getUserAttendance);

// POST /api/attendance/qr-scan - Simulate QR scan
router.post('/qr-scan', attendanceController.simulateQRScan);

module.exports = router;
