import express from 'express';
import { body, param, query } from 'express-validator';
import * as conversionController from '../controllers/conversionController';
import { authenticateToken } from '../middleware/auth';
import { ConversionSource, ConversionType } from '../services/conversionService';

const router = express.Router();

// Track conversion
router.post(
  '/track',
  [
    body('session_id')
      .notEmpty()
      .withMessage('Session ID is required'),
    body('product_id')
      .isInt()
      .withMessage('Product ID must be an integer'),
    body('source')
      .isIn(Object.values(ConversionSource))
      .withMessage('Invalid source'),
    body('type')
      .isIn(Object.values(ConversionType))
      .withMessage('Invalid type'),
    body('url')
      .isURL()
      .withMessage('Invalid URL'),
    body('revenue')
      .optional()
      .isNumeric()
      .withMessage('Revenue must be a number')
  ],
  conversionController.trackConversion
);

// Redirect and track
router.get(
  '/redirect',
  [
    query('pid')
      .isInt()
      .withMessage('Product ID must be an integer'),
    query('src')
      .isIn(Object.values(ConversionSource))
      .withMessage('Invalid source'),
    query('dst')
      .notEmpty()
      .withMessage('Destination URL is required'),
    query('uid')
      .optional()
      .isInt()
      .withMessage('User ID must be an integer'),
    query('sid')
      .optional()
      .isString()
      .withMessage('Session ID must be a string')
  ],
  conversionController.redirectAndTrack
);

// Get product conversions
router.get(
  '/product/:productId',
  [
    param('productId')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  conversionController.getProductConversions
);

// Get user conversions (requires authentication)
router.get(
  '/user',
  authenticateToken,
  conversionController.getUserConversions
);

// Get site conversion stats (requires authentication and admin role)
router.get(
  '/stats',
  authenticateToken,
  conversionController.getSiteConversionStats
);

// Generate tracking link
router.post(
  '/link',
  [
    body('product_id')
      .isInt()
      .withMessage('Product ID must be an integer'),
    body('source')
      .isIn(Object.values(ConversionSource))
      .withMessage('Invalid source'),
    body('destination_url')
      .isURL()
      .withMessage('Invalid destination URL'),
    body('session_id')
      .optional()
      .isString()
      .withMessage('Session ID must be a string')
  ],
  conversionController.generateTrackingLink
);

export default router;
