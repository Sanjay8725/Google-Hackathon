const express = require('express');
const controller = require('../controllers/analyticsController');

const router = express.Router();

router.get('/event/:eventId', controller.getEventAnalytics);
router.get('/dashboard/:organizerId', controller.getDashboardAnalytics);
router.post('/track', controller.trackEngagement);

module.exports = router;
