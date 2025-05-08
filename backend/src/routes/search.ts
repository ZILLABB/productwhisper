import express from 'express';
import { body, param } from 'express-validator';
import * as searchController from '../controllers/searchController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Search for products
router.post(
  '/',
  [
    body('query')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Search query is required'),
    body('filters')
      .optional()
      .isObject()
      .withMessage('Filters must be an object'),
    body('filters.minScore')
      .optional()
      .isFloat({ min: -1, max: 1 })
      .withMessage('Minimum score must be between -1 and 1'),
    body('filters.sources')
      .optional()
      .isArray()
      .withMessage('Sources must be an array'),
    body('filters.minConfidence')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Minimum confidence must be between 0 and 1'),
    body('filters.sortBy')
      .optional()
      .isIn(['score', 'confidence', 'mentions'])
      .withMessage('Sort by must be one of: score, confidence, mentions'),
    body('filters.priceMin')
      .optional()
      .isNumeric()
      .withMessage('Minimum price must be a number'),
    body('filters.priceMax')
      .optional()
      .isNumeric()
      .withMessage('Maximum price must be a number')
  ],
  searchController.search
);

// Get recent searches (requires authentication)
router.get('/recent', authenticateToken, searchController.getRecentSearches);

// Get popular searches
router.get('/popular', searchController.getPopularSearches);

// Get user favorites (requires authentication)
router.get('/favorites', authenticateToken, searchController.getFavorites);

// Add product to favorites (requires authentication)
router.post(
  '/favorites/:productId',
  authenticateToken,
  [
    param('productId')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  searchController.addFavorite
);

// Remove product from favorites (requires authentication)
router.delete(
  '/favorites/:productId',
  authenticateToken,
  [
    param('productId')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  searchController.removeFavorite
);

export default router;
