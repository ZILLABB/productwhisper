import express from 'express';
import { param, query } from 'express-validator';
import * as trendController from '../controllers/trendController';
import { TrendPeriod } from '../services/trendAnalysisService';

const router = express.Router();

// Validate trend period
const validateTrendPeriod = query('period')
  .optional()
  .isIn(Object.values(TrendPeriod))
  .withMessage('Invalid trend period');

// Validate product ID
const validateProductId = param('productId')
  .isInt()
  .withMessage('Product ID must be an integer');

// Get sentiment trend
router.get(
  '/sentiment/:productId',
  [validateProductId, validateTrendPeriod],
  trendController.getSentimentTrend
);

// Get mention trend
router.get(
  '/mentions/:productId',
  [validateProductId, validateTrendPeriod],
  trendController.getMentionTrend
);

// Get aspect trend
router.get(
  '/aspects/:productId',
  [validateProductId, validateTrendPeriod],
  trendController.getAspectTrend
);

// Get all trends
router.get(
  '/all/:productId',
  [validateProductId, validateTrendPeriod],
  trendController.getAllTrends
);

export default router;
