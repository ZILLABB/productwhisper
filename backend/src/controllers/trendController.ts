import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { trendAnalysisService, TrendPeriod, TrendType } from '../services/trendAnalysisService';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/trends/sentiment/{productId}:
 *   get:
 *     summary: Get sentiment trend for a product
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for trend analysis
 *     responses:
 *       200:
 *         description: Sentiment trend data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getSentimentTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const period = req.query.period as TrendPeriod || TrendPeriod.MONTH;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:sentiment:${period}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const trendData = await trendAnalysisService.getSentimentTrend(productId, period);
        
        if (trendData.error) {
          return responseOptimizer.sendError(res, 'Error retrieving sentiment trend', 500, { error: trendData.error });
        }
        
        if (trendData.data_points.length === 0) {
          return responseOptimizer.sendError(res, 'No sentiment data available for this product', 404);
        }
        
        return trendData;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting sentiment trend:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/trends/mentions/{productId}:
 *   get:
 *     summary: Get mention trend for a product
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for trend analysis
 *     responses:
 *       200:
 *         description: Mention trend data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getMentionTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const period = req.query.period as TrendPeriod || TrendPeriod.MONTH;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:mentions:${period}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const trendData = await trendAnalysisService.getMentionTrend(productId, period);
        
        if (trendData.error) {
          return responseOptimizer.sendError(res, 'Error retrieving mention trend', 500, { error: trendData.error });
        }
        
        if (trendData.data_points.length === 0) {
          return responseOptimizer.sendError(res, 'No mention data available for this product', 404);
        }
        
        return trendData;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting mention trend:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/trends/aspects/{productId}:
 *   get:
 *     summary: Get aspect trend for a product
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for trend analysis
 *     responses:
 *       200:
 *         description: Aspect trend data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getAspectTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const period = req.query.period as TrendPeriod || TrendPeriod.MONTH;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:aspects:${period}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const trendData = await trendAnalysisService.getAspectTrend(productId, period);
        
        if (trendData.error) {
          return responseOptimizer.sendError(res, 'Error retrieving aspect trend', 500, { error: trendData.error });
        }
        
        if (trendData.data_points.length === 0) {
          return responseOptimizer.sendError(res, 'No aspect data available for this product', 404);
        }
        
        return trendData;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting aspect trend:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/trends/all/{productId}:
 *   get:
 *     summary: Get all trend data for a product
 *     tags: [Trends]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for trend analysis
 *     responses:
 *       200:
 *         description: All trend data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getAllTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const period = req.query.period as TrendPeriod || TrendPeriod.MONTH;
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:all:${period}`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        // Get all trend data in parallel
        const [sentimentTrend, mentionTrend, aspectTrend] = await Promise.all([
          trendAnalysisService.getSentimentTrend(productId, period),
          trendAnalysisService.getMentionTrend(productId, period),
          trendAnalysisService.getAspectTrend(productId, period)
        ]);
        
        // Check for errors
        if (sentimentTrend.error || mentionTrend.error || aspectTrend.error) {
          return responseOptimizer.sendError(res, 'Error retrieving trend data', 500, { 
            sentimentError: sentimentTrend.error,
            mentionError: mentionTrend.error,
            aspectError: aspectTrend.error
          });
        }
        
        // Check if any data is available
        if (
          sentimentTrend.data_points.length === 0 && 
          mentionTrend.data_points.length === 0 && 
          aspectTrend.data_points.length === 0
        ) {
          return responseOptimizer.sendError(res, 'No trend data available for this product', 404);
        }
        
        return {
          product_id: productId,
          period,
          sentiment: sentimentTrend,
          mentions: mentionTrend,
          aspects: aspectTrend
        };
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting all trends:', error);
    next(error);
  }
};
