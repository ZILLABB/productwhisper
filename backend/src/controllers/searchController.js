const { pool } = require('../config/db');
const { redisClient } = require('../config/redis');
const { searchProducts } = require('../services/productSearch');

/**
 * Perform a product search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const search = async (req, res, next) => {
  try {
    const { query, filters } = req.body;
    
    // Validate input
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Get user ID if authenticated
    const userId = req.user ? req.user.id : null;
    
    // Perform search
    const results = await searchProducts(query, filters);
    
    // Log the search if user is authenticated
    if (userId) {
      await pool.query(
        'INSERT INTO user_searches (user_id, query, results_count) VALUES ($1, $2, $3)',
        [userId, query, results.length]
      );
    }
    
    res.json({
      query,
      results_count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent searches for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRecentSearches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT id, query, created_at, results_count FROM user_searches WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    
    res.json({
      searches: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search,
  getRecentSearches
};
