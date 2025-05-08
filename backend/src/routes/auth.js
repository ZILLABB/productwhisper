const express = require('express');
const router = express.Router();
const { register, login, refresh, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Refresh token
router.post('/refresh', refresh);

// Get current user (protected route)
router.get('/me', authenticateToken, getMe);

module.exports = router;
