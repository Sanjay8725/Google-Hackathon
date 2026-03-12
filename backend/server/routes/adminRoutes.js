const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// GET /api/admin/dashboard - Get admin dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/organizers - Get all organizers with verification status
router.get('/organizers', adminController.getOrganizers);

// GET /api/admin/users/search?q=keyword - Search users
router.get('/users/search', adminController.searchUsers);

// POST /api/admin/users - Create user with credentials
router.post('/users', adminController.createUser);

// PUT /api/admin/users/:id - Update user (ban, approve, role change)
router.put('/users/:id', adminController.updateUser);

// PUT /api/admin/organizers/:id/status - Approve/reject organizer profile
router.put('/organizers/:id/status', adminController.updateOrganizerStatus);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminController.deleteUser);

// GET /api/admin/events - Get all events (with filters)
router.get('/events', adminController.getAllEvents);

// GET /api/admin/events/search?q=keyword - Search events
router.get('/events/search', adminController.searchEvents);

// PUT /api/admin/events/:id/approve - Approve event
router.put('/events/:id/approve', adminController.approveEvent);

// PUT /api/admin/events/:id - Edit event
router.put('/events/:id', adminController.updateEvent);

// DELETE /api/admin/events/:id - Delete event
router.delete('/events/:id', adminController.deleteEvent);

// GET /api/admin/registrations - Get registrations (optionally filtered by event)
router.get('/registrations', adminController.getRegistrations);

// GET /api/admin/registrations/export - Export registrations CSV (optionally by event)
router.get('/registrations/export', adminController.exportRegistrations);

// GET /api/admin/analytics - Get system-wide analytics
router.get('/analytics', adminController.getSystemAnalytics);

// GET /api/admin/reports - Generate reports
router.get('/reports', adminController.generateReports);

// POST /api/admin/announcements - Create announcement
router.post('/announcements', adminController.createAnnouncement);

// GET /api/admin/feedback - Get feedback and complaints
router.get('/feedback', adminController.getFeedback);

// GET /api/admin/settings - Get admin settings
router.get('/settings', adminController.getSettings);

// PUT /api/admin/settings - Update admin settings
router.put('/settings', adminController.updateSettings);

// GET /api/admin/logs - Get system activity logs
router.get('/logs', adminController.getActivityLogs);

module.exports = router;
