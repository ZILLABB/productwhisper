import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { analyticsService, AnalyticsEventType } from '../services/analyticsService';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/analytics/track:
 *   post:
 *     summary: Track an analytics event
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *               - event_type
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Client session ID
 *               event_type:
 *                 type: string
 *                 enum: [page_view, search, product_view, favorite_add, favorite_remove, external_link_click, comparison_view, trend_view, recommendation_click, share, signup, login, logout]
 *                 description: Type of event
 *               page:
 *                 type: string
 *                 description: Page where the event occurred
 *               data:
 *                 type: object
 *                 description: Additional event data
 *     responses:
 *       200:
 *         description: Event tracked successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const trackEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseOptimizer.sendError(res, 'Validation failed', 400, errors.array());
    }
    
    const { session_id, event_type, page, data } = req.body;
    
    if (!session_id || !event_type) {
      return responseOptimizer.sendError(res, 'Session ID and event type are required', 400);
    }
    
    // Get user ID from authenticated user if available
    const userId = req.user ? req.user.id : null;
    
    // Get IP address and user agent
    const ip_address = req.ip || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    // Track event
    const event = await analyticsService.trackEvent({
      user_id: userId,
      session_id,
      event_type: event_type as AnalyticsEventType,
      page,
      data,
      ip_address,
      user_agent
    });
    
    if (!event) {
      return responseOptimizer.sendError(res, 'Failed to track event', 500);
    }
    
    responseOptimizer.sendSuccess(res, { 
      message: 'Event tracked successfully',
      event_id: event.id
    });
  } catch (error) {
    logger.error('Error tracking event:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/analytics/user:
 *   get:
 *     summary: Get user analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:analytics`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const analytics = await analyticsService.getUserAnalytics(userId);
        
        if (analytics.error) {
          return responseOptimizer.sendError(res, 'Error retrieving user analytics', 500, { error: analytics.error });
        }
        
        return analytics;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/analytics/product/{productId}:
 *   get:
 *     summary: Get product analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product analytics data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getProductAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:analytics`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const analytics = await analyticsService.getProductAnalytics(productId);
        
        if (analytics.error) {
          return responseOptimizer.sendError(res, 'Error retrieving product analytics', 500, { error: analytics.error });
        }
        
        return analytics;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting product analytics:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/analytics/site:
 *   get:
 *     summary: Get site-wide analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Site analytics data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       500:
 *         description: Server error
 */
export const getSiteAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return responseOptimizer.sendError(res, 'Admin access required', 403);
    }
    
    // Create cache key
    const cacheKey = `${CachePrefix.SITE}analytics`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const analytics = await analyticsService.getSiteAnalytics();
        
        if (analytics.error) {
          return responseOptimizer.sendError(res, 'Error retrieving site analytics', 500, { error: analytics.error });
        }
        
        return analytics;
      },
      CacheTTL.SHORT
    );
  } catch (error) {
    logger.error('Error getting site analytics:', error);
    next(error);
  }
};
