const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/:role', authController.login);
router.get('/profile/:id', authController.getProfile);

module.exports = router;
