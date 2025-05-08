import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { comparisonService } from '../services/comparisonService';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/compare:
 *   post:
 *     summary: Compare products
 *     tags: [Comparison]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_ids
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of product IDs to compare
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Comparison data
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Products not found
 *       500:
 *         description: Server error
 */
export const compareProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseOptimizer.sendError(res, 'Validation failed', 400, errors.array());
    }
    
    const { product_ids } = req.body;
    
    if (!product_ids || !Array.isArray(product_ids) || product_ids.length < 2) {
      return responseOptimizer.sendError(res, 'At least two product IDs are required', 400);
    }
    
    // Sort product IDs for consistent caching
    const sortedProductIds = [...product_ids].sort((a, b) => a - b);
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}compare:${sortedProductIds.join('-')}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const comparisonData = await comparisonService.compareProducts(product_ids);
        
        if (comparisonData.error) {
          if (comparisonData.error.includes('not found')) {
            return responseOptimizer.sendError(res, comparisonData.error, 404);
          } else {
            return responseOptimizer.sendError(res, comparisonData.error, 500);
          }
        }
        
        return comparisonData;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error comparing products:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/compare/quick:
 *   get:
 *     summary: Quick compare products
 *     tags: [Comparison]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of product IDs
 *         example: 1,2,3
 *     responses:
 *       200:
 *         description: Comparison data
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Products not found
 *       500:
 *         description: Server error
 */
export const quickCompare = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idsParam = req.query.ids as string;
    
    if (!idsParam) {
      return responseOptimizer.sendError(res, 'Product IDs are required', 400);
    }
    
    // Parse product IDs
    const productIds = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (productIds.length < 2) {
      return responseOptimizer.sendError(res, 'At least two valid product IDs are required', 400);
    }
    
    // Sort product IDs for consistent caching
    const sortedProductIds = [...productIds].sort((a, b) => a - b);
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}compare:${sortedProductIds.join('-')}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const comparisonData = await comparisonService.compareProducts(productIds);
        
        if (comparisonData.error) {
          if (comparisonData.error.includes('not found')) {
            return responseOptimizer.sendError(res, comparisonData.error, 404);
          } else {
            return responseOptimizer.sendError(res, comparisonData.error, 500);
          }
        }
        
        return comparisonData;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error quick comparing products:', error);
    next(error);
  }
};
