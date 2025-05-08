const express = require('express');
const router = express.Router();
const { search, getRecentSearches } = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/auth');

// Perform a product search (can be used without authentication)
router.post('/', search);

// Get recent searches (requires authentication)
router.get('/recent', authenticateToken, getRecentSearches);

module.exports = router;
