import { pool } from '../config/db';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';
import logger from './loggerService';
import { analyticsService, AnalyticsEventType } from './analyticsService';

/**
 * Conversion source
 */
export enum ConversionSource {
  AMAZON = 'amazon',
  REDDIT = 'reddit',
  YOUTUBE = 'youtube',
  EXTERNAL = 'external'
}

/**
 * Conversion type
 */
export enum ConversionType {
  CLICK = 'click',
  PURCHASE = 'purchase',
  SIGNUP = 'signup',
  SHARE = 'share'
}

/**
 * Conversion service for tracking product link conversions
 */
export class ConversionService {
  /**
   * Track a conversion
   * @param conversion - Conversion data
   * @returns Tracked conversion
   */
  async trackConversion(conversion: {
    user_id?: number;
    session_id: string;
    product_id: number;
    source: ConversionSource;
    type: ConversionType;
    url: string;
    revenue?: number;
    data?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<any> {
    try {
      // Insert conversion into database
      const result = await queryOptimizer.insert(
        `INSERT INTO conversions 
         (user_id, session_id, product_id, source, type, url, revenue, data, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          conversion.user_id || null,
          conversion.session_id,
          conversion.product_id,
          conversion.source,
          conversion.type,
          conversion.url,
          conversion.revenue || 0,
          conversion.data || null,
          conversion.ip_address || null,
          conversion.user_agent || null
        ]
      );
      
      // Track analytics event
      await analyticsService.trackEvent({
        user_id: conversion.user_id,
        session_id: conversion.session_id,
        event_type: AnalyticsEventType.EXTERNAL_LINK_CLICK,
        data: {
          product_id: conversion.product_id,
          source: conversion.source,
          type: conversion.type,
          url: conversion.url
        },
        ip_address: conversion.ip_address,
        user_agent: conversion.user_agent
      });
      
      // Invalidate relevant caches
      await cacheService.delete(`${CachePrefix.PRODUCT}${conversion.product_id}:conversions`);
      if (conversion.user_id) {
        await cacheService.delete(`${CachePrefix.USER}${conversion.user_id}:conversions`);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error tracking conversion:', error);
      return null;
    }
  }
  
  /**
   * Generate a tracking link
   * @param params - Link parameters
   * @returns Tracking link
   */
  generateTrackingLink(params: {
    product_id: number;
    source: ConversionSource;
    destination_url: string;
    user_id?: number;
    session_id?: string;
  }): string {
    try {
      // Create base URL
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const trackingUrl = new URL(`${baseUrl}/api/conversions/redirect`);
      
      // Add parameters
      trackingUrl.searchParams.append('pid', params.product_id.toString());
      trackingUrl.searchParams.append('src', params.source);
      trackingUrl.searchParams.append('dst', encodeURIComponent(params.destination_url));
      
      if (params.user_id) {
        trackingUrl.searchParams.append('uid', params.user_id.toString());
      }
      
      if (params.session_id) {
        trackingUrl.searchParams.append('sid', params.session_id);
      }
      
      return trackingUrl.toString();
    } catch (error) {
      logger.error('Error generating tracking link:', error);
      return params.destination_url;
    }
  }
  
  /**
   * Get product conversions
   * @param productId - Product ID
   * @returns Product conversions
   */
  async getProductConversions(productId: number): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:conversions`;
      
      // Try to get from cache
      const cachedConversions = await cacheService.get<any>(cacheKey);
      if (cachedConversions) {
        return cachedConversions;
      }
      
      // Get conversion counts by source and type
      const conversionCountsResult = await queryOptimizer.select(
        `SELECT 
           source,
           type,
           COUNT(*) as count,
           SUM(revenue) as total_revenue
         FROM conversions
         WHERE product_id = $1
         GROUP BY source, type`,
        [productId]
      );
      
      // Get conversion timeline
      const conversionTimelineResult = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           source,
           COUNT(*) as count,
           SUM(revenue) as revenue
         FROM conversions
         WHERE product_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date, source
         ORDER BY date ASC, source`,
        [productId]
      );
      
      // Group by source and type
      const conversionCounts = {};
      conversionCountsResult.rows.forEach(row => {
        if (!conversionCounts[row.source]) {
          conversionCounts[row.source] = {};
        }
        
        conversionCounts[row.source][row.type] = {
          count: parseInt(row.count),
          revenue: parseFloat(row.total_revenue)
        };
      });
      
      // Group timeline by date and source
      const timelineByDate = {};
      conversionTimelineResult.rows.forEach(row => {
        const date = row.date;
        const source = row.source;
        
        if (!timelineByDate[date]) {
          timelineByDate[date] = {};
        }
        
        timelineByDate[date][source] = {
          count: parseInt(row.count),
          revenue: parseFloat(row.revenue)
        };
      });
      
      // Convert to array format
      const timeline = Object.keys(timelineByDate).map(date => {
        const point = { date };
        
        Object.keys(timelineByDate[date]).forEach(source => {
          point[`${source}_count`] = timelineByDate[date][source].count;
          point[`${source}_revenue`] = timelineByDate[date][source].revenue;
        });
        
        return point;
      });
      
      // Calculate totals
      let totalClicks = 0;
      let totalRevenue = 0;
      
      Object.values(conversionCounts).forEach((sourceData: any) => {
        Object.values(sourceData).forEach((typeData: any) => {
          totalClicks += typeData.count;
          totalRevenue += typeData.revenue;
        });
      });
      
      const conversions = {
        product_id: productId,
        total_clicks: totalClicks,
        total_revenue: totalRevenue,
        by_source: conversionCounts,
        timeline
      };
      
      // Cache results
      await cacheService.set(cacheKey, conversions, CacheTTL.MEDIUM);
      
      return conversions;
    } catch (error) {
      logger.error('Error getting product conversions:', error);
      return {
        product_id: productId,
        total_clicks: 0,
        total_revenue: 0,
        by_source: {},
        timeline: [],
        error: error.message
      };
    }
  }
  
  /**
   * Get user conversions
   * @param userId - User ID
   * @returns User conversions
   */
  async getUserConversions(userId: number): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:conversions`;
      
      // Try to get from cache
      const cachedConversions = await cacheService.get<any>(cacheKey);
      if (cachedConversions) {
        return cachedConversions;
      }
      
      // Get conversion counts by product, source, and type
      const conversionCountsResult = await queryOptimizer.select(
        `SELECT 
           c.product_id,
           p.name as product_name,
           c.source,
           c.type,
           COUNT(*) as count
         FROM conversions c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         GROUP BY c.product_id, p.name, c.source, c.type`,
        [userId]
      );
      
      // Get recent conversions
      const recentConversionsResult = await queryOptimizer.select(
        `SELECT 
           c.*,
           p.name as product_name
         FROM conversions c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC
         LIMIT 10`,
        [userId]
      );
      
      // Group by product, source, and type
      const conversionsByProduct = {};
      conversionCountsResult.rows.forEach(row => {
        if (!conversionsByProduct[row.product_id]) {
          conversionsByProduct[row.product_id] = {
            product_id: row.product_id,
            product_name: row.product_name,
            sources: {}
          };
        }
        
        if (!conversionsByProduct[row.product_id].sources[row.source]) {
          conversionsByProduct[row.product_id].sources[row.source] = {};
        }
        
        conversionsByProduct[row.product_id].sources[row.source][row.type] = parseInt(row.count);
      });
      
      const conversions = {
        user_id: userId,
        by_product: Object.values(conversionsByProduct),
        recent: recentConversionsResult.rows
      };
      
      // Cache results
      await cacheService.set(cacheKey, conversions, CacheTTL.MEDIUM);
      
      return conversions;
    } catch (error) {
      logger.error('Error getting user conversions:', error);
      return {
        user_id: userId,
        by_product: [],
        recent: [],
        error: error.message
      };
    }
  }
  
  /**
   * Get site-wide conversion statistics
   * @returns Site-wide conversion statistics
   */
  async getSiteConversionStats(): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.SITE}conversions`;
      
      // Try to get from cache
      const cachedStats = await cacheService.get<any>(cacheKey);
      if (cachedStats) {
        return cachedStats;
      }
      
      // Get total conversions and revenue
      const totalsResult = await queryOptimizer.select(
        `SELECT 
           COUNT(*) as total_conversions,
           SUM(revenue) as total_revenue
         FROM conversions`
      );
      
      // Get conversions by source
      const bySourceResult = await queryOptimizer.select(
        `SELECT 
           source,
           COUNT(*) as count,
           SUM(revenue) as revenue
         FROM conversions
         GROUP BY source`
      );
      
      // Get conversions by type
      const byTypeResult = await queryOptimizer.select(
        `SELECT 
           type,
           COUNT(*) as count,
           SUM(revenue) as revenue
         FROM conversions
         GROUP BY type`
      );
      
      // Get top converting products
      const topProductsResult = await queryOptimizer.select(
        `SELECT 
           c.product_id,
           p.name as product_name,
           COUNT(*) as conversion_count,
           SUM(c.revenue) as total_revenue
         FROM conversions c
         JOIN products p ON c.product_id = p.id
         GROUP BY c.product_id, p.name
         ORDER BY conversion_count DESC
         LIMIT 10`
      );
      
      // Get conversion timeline
      const timelineResult = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           COUNT(*) as count,
           SUM(revenue) as revenue
         FROM conversions
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`
      );
      
      const stats = {
        total_conversions: parseInt(totalsResult.rows[0].total_conversions),
        total_revenue: parseFloat(totalsResult.rows[0].total_revenue),
        by_source: bySourceResult.rows.map(row => ({
          source: row.source,
          count: parseInt(row.count),
          revenue: parseFloat(row.revenue)
        })),
        by_type: byTypeResult.rows.map(row => ({
          type: row.type,
          count: parseInt(row.count),
          revenue: parseFloat(row.revenue)
        })),
        top_products: topProductsResult.rows.map(row => ({
          product_id: row.product_id,
          product_name: row.product_name,
          conversion_count: parseInt(row.conversion_count),
          total_revenue: parseFloat(row.total_revenue)
        })),
        timeline: timelineResult.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count),
          revenue: parseFloat(row.revenue)
        }))
      };
      
      // Cache results
      await cacheService.set(cacheKey, stats, CacheTTL.SHORT);
      
      return stats;
    } catch (error) {
      logger.error('Error getting site conversion stats:', error);
      return {
        total_conversions: 0,
        total_revenue: 0,
        by_source: [],
        by_type: [],
        top_products: [],
        timeline: [],
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const conversionService = new ConversionService();
