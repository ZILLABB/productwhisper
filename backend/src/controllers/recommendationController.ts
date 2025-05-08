import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { recommendationService, RecommendationType } from '../services/recommendationService';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/recommendations/personalized:
 *   get:
 *     summary: Get personalized recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:recommendations:personalized:${limit}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
        return { recommendations };
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting personalized recommendations:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Trending products
 *       500:
 *         description: Server error
 */
export const getTrendingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}trending:${limit}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const recommendations = await recommendationService.getTrendingProducts(limit);
        return { recommendations };
      },
      CacheTTL.SHORT
    );
  } catch (error) {
    logger.error('Error getting trending products:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/recommendations/similar/{productId}:
 *   get:
 *     summary: Get similar products
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Similar products
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getSimilarProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:similar:${limit}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const recommendations = await recommendationService.getSimilarProducts(productId, limit);
        
        if (recommendations.length === 0) {
          return responseOptimizer.sendError(res, 'Product not found or no similar products available', 404);
        }
        
        return { recommendations };
      },
      CacheTTL.LONG
    );
  } catch (error) {
    logger.error('Error getting similar products:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/recommendations/from-favorites:
 *   get:
 *     summary: Get recommendations based on user favorites
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Recommendations based on favorites
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getRecommendationsFromFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:recommendations:favorites:${limit}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const recommendations = await recommendationService.getRecommendationsFromFavorites(userId, limit);
        return { recommendations };
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting recommendations from favorites:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/recommendations/from-searches:
 *   get:
 *     summary: Get recommendations based on user searches
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: Recommendations based on searches
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getRecommendationsFromSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:recommendations:searches:${limit}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const recommendations = await recommendationService.getRecommendationsFromSearches(userId, limit);
        return { recommendations };
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting recommendations from searches:', error);
    next(error);
  }
};
