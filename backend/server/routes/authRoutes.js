const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login (deprecated)
router.post('/login', authController.login);

// POST /api/auth/login/admin
router.post('/login/admin', authController.loginAdmin);

// POST /api/auth/login/organizer
router.post('/login/organizer', authController.loginOrganizer);

// POST /api/auth/login/attendee
router.post('/login/attendee', authController.loginAttendee);

// GET /api/auth/profile/:id
router.get('/profile/:id', authController.getProfile);

module.exports = router;
