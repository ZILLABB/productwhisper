import express from 'express';
import { param } from 'express-validator';
import * as recommendationController from '../controllers/recommendationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/trending', recommendationController.getTrendingProducts);

router.get(
  '/similar/:productId',
  [
    param('productId')
      .isInt()
      .withMessage('Product ID must be an integer')
  ],
  recommendationController.getSimilarProducts
);

// Protected routes (require authentication)
router.get(
  '/personalized',
  authenticateToken,
  recommendationController.getPersonalizedRecommendations
);

router.get(
  '/from-favorites',
  authenticateToken,
  recommendationController.getRecommendationsFromFavorites
);

router.get(
  '/from-searches',
  authenticateToken,
  recommendationController.getRecommendationsFromSearches
);

export default router;
