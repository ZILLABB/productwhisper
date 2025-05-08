import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { conversionService, ConversionSource, ConversionType } from '../services/conversionService';
import { responseOptimizer } from '../services/responseOptimizer';
import { cacheService, CachePrefix, CacheTTL } from '../services/cacheService';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/conversions/track:
 *   post:
 *     summary: Track a conversion
 *     tags: [Conversions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *               - product_id
 *               - source
 *               - type
 *               - url
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Client session ID
 *               product_id:
 *                 type: integer
 *                 description: Product ID
 *               source:
 *                 type: string
 *                 enum: [amazon, reddit, youtube, external]
 *                 description: Conversion source
 *               type:
 *                 type: string
 *                 enum: [click, purchase, signup, share]
 *                 description: Conversion type
 *               url:
 *                 type: string
 *                 description: Destination URL
 *               revenue:
 *                 type: number
 *                 description: Revenue amount (for purchase conversions)
 *               data:
 *                 type: object
 *                 description: Additional conversion data
 *     responses:
 *       200:
 *         description: Conversion tracked successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const trackConversion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseOptimizer.sendError(res, 'Validation failed', 400, errors.array());
    }
    
    const { session_id, product_id, source, type, url, revenue, data } = req.body;
    
    if (!session_id || !product_id || !source || !type || !url) {
      return responseOptimizer.sendError(res, 'Missing required fields', 400);
    }
    
    // Get user ID from authenticated user if available
    const userId = req.user ? req.user.id : null;
    
    // Get IP address and user agent
    const ip_address = req.ip || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    // Track conversion
    const conversion = await conversionService.trackConversion({
      user_id: userId,
      session_id,
      product_id,
      source: source as ConversionSource,
      type: type as ConversionType,
      url,
      revenue,
      data,
      ip_address,
      user_agent
    });
    
    if (!conversion) {
      return responseOptimizer.sendError(res, 'Failed to track conversion', 500);
    }
    
    responseOptimizer.sendSuccess(res, { 
      message: 'Conversion tracked successfully',
      conversion_id: conversion.id
    });
  } catch (error) {
    logger.error('Error tracking conversion:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/conversions/redirect:
 *   get:
 *     summary: Redirect and track a conversion
 *     tags: [Conversions]
 *     parameters:
 *       - in: query
 *         name: pid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: query
 *         name: src
 *         required: true
 *         schema:
 *           type: string
 *         description: Source
 *       - in: query
 *         name: dst
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination URL (encoded)
 *       - in: query
 *         name: uid
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: sid
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       302:
 *         description: Redirect to destination URL
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const redirectAndTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pid, src, dst, uid, sid } = req.query;
    
    if (!pid || !src || !dst) {
      return responseOptimizer.sendError(res, 'Missing required parameters', 400);
    }
    
    // Parse parameters
    const productId = parseInt(pid as string);
    const source = src as ConversionSource;
    const destinationUrl = decodeURIComponent(dst as string);
    const userId = uid ? parseInt(uid as string) : null;
    const sessionId = sid as string || req.sessionID || `anon-${Date.now()}`;
    
    // Get IP address and user agent
    const ip_address = req.ip || req.socket.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    // Track conversion asynchronously (don't wait for it to complete)
    conversionService.trackConversion({
      user_id: userId,
      session_id: sessionId,
      product_id: productId,
      source,
      type: ConversionType.CLICK,
      url: destinationUrl,
      ip_address,
      user_agent
    }).catch(error => {
      logger.error('Error tracking redirect conversion:', error);
    });
    
    // Redirect to destination URL
    res.redirect(destinationUrl);
  } catch (error) {
    logger.error('Error redirecting and tracking:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/conversions/product/{productId}:
 *   get:
 *     summary: Get product conversions
 *     tags: [Conversions]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product conversions
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
export const getProductConversions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    
    // Create cache key
    const cacheKey = `${CachePrefix.PRODUCT}${productId}:conversions`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const conversions = await conversionService.getProductConversions(productId);
        
        if (conversions.error) {
          return responseOptimizer.sendError(res, 'Error retrieving product conversions', 500, { error: conversions.error });
        }
        
        return conversions;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting product conversions:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/conversions/user:
 *   get:
 *     summary: Get user conversions
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User conversions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getUserConversions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Create cache key
    const cacheKey = `${CachePrefix.USER}${userId}:conversions`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const conversions = await conversionService.getUserConversions(userId);
        
        if (conversions.error) {
          return responseOptimizer.sendError(res, 'Error retrieving user conversions', 500, { error: conversions.error });
        }
        
        return conversions;
      },
      CacheTTL.MEDIUM
    );
  } catch (error) {
    logger.error('Error getting user conversions:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/conversions/stats:
 *   get:
 *     summary: Get site-wide conversion statistics
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Site-wide conversion statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       500:
 *         description: Server error
 */
export const getSiteConversionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return responseOptimizer.sendError(res, 'Admin access required', 403);
    }
    
    // Create cache key
    const cacheKey = `${CachePrefix.SITE}conversions`;
    
    // Use cached response or generate a new one
    await responseOptimizer.sendCached(
      req,
      res,
      cacheKey,
      async () => {
        const stats = await conversionService.getSiteConversionStats();
        
        if (stats.error) {
          return responseOptimizer.sendError(res, 'Error retrieving site conversion stats', 500, { error: stats.error });
        }
        
        return stats;
      },
      CacheTTL.SHORT
    );
  } catch (error) {
    logger.error('Error getting site conversion stats:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/conversions/link:
 *   post:
 *     summary: Generate a tracking link
 *     tags: [Conversions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - source
 *               - destination_url
 *             properties:
 *               product_id:
 *                 type: integer
 *                 description: Product ID
 *               source:
 *                 type: string
 *                 enum: [amazon, reddit, youtube, external]
 *                 description: Conversion source
 *               destination_url:
 *                 type: string
 *                 description: Destination URL
 *               session_id:
 *                 type: string
 *                 description: Client session ID
 *     responses:
 *       200:
 *         description: Tracking link generated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export const generateTrackingLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseOptimizer.sendError(res, 'Validation failed', 400, errors.array());
    }
    
    const { product_id, source, destination_url, session_id } = req.body;
    
    if (!product_id || !source || !destination_url) {
      return responseOptimizer.sendError(res, 'Missing required fields', 400);
    }
    
    // Get user ID from authenticated user if available
    const userId = req.user ? req.user.id : null;
    
    // Generate tracking link
    const trackingLink = conversionService.generateTrackingLink({
      product_id,
      source: source as ConversionSource,
      destination_url,
      user_id: userId,
      session_id
    });
    
    responseOptimizer.sendSuccess(res, { 
      tracking_link: trackingLink,
      original_url: destination_url
    });
  } catch (error) {
    logger.error('Error generating tracking link:', error);
    next(error);
  }
};
