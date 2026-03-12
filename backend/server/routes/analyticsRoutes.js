const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/event/:eventId - Get comprehensive event analytics
router.get('/event/:eventId', analyticsController.getEventAnalytics);

// GET /api/analytics/dashboard/:organizerId - Get organizer dashboard stats
router.get('/dashboard/:organizerId', analyticsController.getDashboardAnalytics);

// POST /api/analytics/track - Track engagement action
router.post('/track', analyticsController.trackEngagement);

module.exports = router;
