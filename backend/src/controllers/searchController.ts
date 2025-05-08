import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { productRepository, searchRepository } from '../repositories';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/search:
 *   post:
 *     summary: Search for products
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               filters:
 *                 type: object
 *                 properties:
 *                   minScore:
 *                     type: number
 *                   sources:
 *                     type: array
 *                     items:
 *                       type: string
 *                   minConfidence:
 *                     type: number
 *                   sortBy:
 *                     type: string
 *                     enum: [score, confidence, mentions]
 *                   category:
 *                     type: string
 *                   brand:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   priceMin:
 *                     type: number
 *                   priceMax:
 *                     type: number
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseOptimizer.sendError(res, 'Validation failed', 400, errors.array());
    }

    const { query, filters } = req.body;

    if (!query || typeof query !== 'string') {
      return responseOptimizer.sendError(res, 'Search query is required', 400);
    }

    // Create cache key
    const cacheKey = responseOptimizer.createCacheKey(req, CachePrefix.SEARCH);

    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        // Start timer for performance tracking
        const startTime = Date.now();

        // Perform search
        const searchResults = await productRepository.searchProducts(query, filters);

        // Log search if user is authenticated
        if (req.user) {
          await searchRepository.logSearch(
            req.user.id,
            query,
            searchResults.data.length
          );
        }

        // Log performance
        const duration = Date.now() - startTime;
        logger.info(`Search completed in ${duration}ms: "${query}" (${searchResults.data.length} results)`);

        // Return formatted response
        return {
          query,
          results_count: searchResults.data.length,
          ...searchResults
        };
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Search error:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/search/recent:
 *   get:
 *     summary: Get recent searches for the current user
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent searches
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getRecentSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:recent_searches`;

    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const searches = await searchRepository.getRecentSearches(userId);
        return { searches };
      },
      CacheTTL.SHORT // Short TTL since this data changes frequently
    );
  } catch (error) {
    logger.error('Get recent searches error:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/search/popular:
 *   get:
 *     summary: Get popular searches across all users
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Popular searches
 *       500:
 *         description: Server error
 */
export const getPopularSearches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create cache key
    const cacheKey = `${CachePrefix.SEARCH}popular`;

    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const searches = await searchRepository.getPopularSearches();
        return { searches };
      },
      CacheTTL.MEDIUM // Medium TTL since this data changes moderately frequently
    );
  } catch (error) {
    logger.error('Get popular searches error:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/search/favorites:
 *   get:
 *     summary: Get favorite products for the current user
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite products
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:favorites`;

    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const favorites = await searchRepository.getUserFavorites(userId);
        return { favorites };
      },
      CacheTTL.SHORT // Short TTL since this data changes frequently
    );
  } catch (error) {
    logger.error('Get favorites error:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/search/favorites/{productId}:
 *   post:
 *     summary: Add a product to favorites
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product added to favorites
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    // Check if product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      return responseOptimizer.sendError(res, 'Product not found', 404);
    }

    // Check if already in favorites
    const isFavorite = await searchRepository.isFavorite(userId, productId);
    if (isFavorite) {
      return responseOptimizer.sendError(res, 'Product is already in favorites', 400);
    }

    // Add to favorites
    const favorite = await searchRepository.addFavorite(userId, productId);

    // Invalidate user favorites cache
    await cacheService.delete(`${CachePrefix.USER}${userId}:favorites`);

    // Send success response
    responseOptimizer.sendSuccess(res, {
      message: 'Product added to favorites',
      favorite
    });
  } catch (error) {
    logger.error('Add favorite error:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/search/favorites/{productId}:
 *   delete:
 *     summary: Remove a product from favorites
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from favorites
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or not in favorites
 *       500:
 *         description: Server error
 */
export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    // Check if in favorites
    const isFavorite = await searchRepository.isFavorite(userId, productId);
    if (!isFavorite) {
      return responseOptimizer.sendError(res, 'Product is not in favorites', 404);
    }

    // Remove from favorites
    const success = await searchRepository.removeFavorite(userId, productId);

    if (success) {
      // Invalidate user favorites cache
      await cacheService.delete(`${CachePrefix.USER}${userId}:favorites`);

      // Send success response
      responseOptimizer.sendSuccess(res, {
        message: 'Product removed from favorites'
      });
    } else {
      responseOptimizer.sendError(res, 'Failed to remove product from favorites', 500);
    }
  } catch (error) {
    logger.error('Remove favorite error:', error);
    next(error);
  }
};
