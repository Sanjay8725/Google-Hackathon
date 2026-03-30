const express = require('express');
const controller = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);
router.put('/users/:userId', controller.updateUser);
router.delete('/users/:userId', controller.deleteUser);

router.get('/organizers', controller.getOrganizers);
router.put('/organizers/:organizerId/status', controller.updateOrganizerStatus);

router.get('/events', controller.getEvents);
router.post('/events', controller.createEvent);
router.put('/events/:eventId', controller.updateEvent);
router.delete('/events/:eventId', controller.deleteEvent);
router.put('/events/:eventId/approve', controller.approveEvent);

router.get('/analytics', controller.getSystemAnalytics);
router.get('/registrations', controller.getRegistrations);
router.get('/registrations/export', controller.exportRegistrations);
router.get('/reports', controller.generateReport);
router.post('/announcements', controller.createAnnouncement);
router.get('/feedback', controller.getFeedback);
router.get('/settings', controller.getSettings);
router.put('/settings', controller.updateSettings);
router.get('/logs', controller.getLogs);

module.exports = router;
