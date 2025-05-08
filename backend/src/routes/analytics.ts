import express from 'express';
import { body, param } from 'express-validator';
import * as analyticsController from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';
import { AnalyticsEventType } from '../services/analyticsService';

const router = express.Router();

// Track analytics event
router.post(
  '/track',
  [
    body('session_id')
      .notEmpty()
      .withMessage('Session ID is required'),
    body('event_type')
      .isIn(Object.values(AnalyticsEventType))
      .withMessage('Invalid event type')
  ],
  analyticsController.trackEvent
);

// Get user analytics (requires authentication)
router.get(
  '/user',
  authenticateToken,
  analyticsController.getUserAnalytics
);

// Get product analytics
router.get(
  '/product/:productId',
  [
    param('productId')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  analyticsController.getProductAnalytics
);

// Get site analytics (requires authentication and admin role)
router.get(
  '/site',
  authenticateToken,
  analyticsController.getSiteAnalytics
);

export default router;
