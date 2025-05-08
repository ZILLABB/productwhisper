import { pool } from '../config/db';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';
import logger from './loggerService';

/**
 * Analytics event types
 */
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  SEARCH = 'search',
  PRODUCT_VIEW = 'product_view',
  FAVORITE_ADD = 'favorite_add',
  FAVORITE_REMOVE = 'favorite_remove',
  EXTERNAL_LINK_CLICK = 'external_link_click',
  COMPARISON_VIEW = 'comparison_view',
  TREND_VIEW = 'trend_view',
  RECOMMENDATION_CLICK = 'recommendation_click',
  SHARE = 'share',
  SIGNUP = 'signup',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

/**
 * Analytics service for tracking user behavior
 */
export class AnalyticsService {
  /**
   * Track an analytics event
   * @param event - Event data
   * @returns Tracked event
   */
  async trackEvent(event: {
    user_id?: number;
    session_id: string;
    event_type: AnalyticsEventType;
    page?: string;
    data?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<any> {
    try {
      // Insert event into database
      const result = await queryOptimizer.insert(
        `INSERT INTO analytics_events 
         (user_id, session_id, event_type, page, data, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          event.user_id || null,
          event.session_id,
          event.event_type,
          event.page || null,
          event.data || null,
          event.ip_address || null,
          event.user_agent || null
        ]
      );
      
      // Invalidate relevant caches
      if (event.user_id) {
        await cacheService.delete(`${CachePrefix.USER}${event.user_id}:analytics`);
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
      return null;
    }
  }
  
  /**
   * Get user analytics
   * @param userId - User ID
   * @returns User analytics data
   */
  async getUserAnalytics(userId: number): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:analytics`;
      
      // Try to get from cache
      const cachedAnalytics = await cacheService.get<any>(cacheKey);
      if (cachedAnalytics) {
        return cachedAnalytics;
      }
      
      // Get event counts by type
      const eventCountsResult = await queryOptimizer.select(
        `SELECT 
           event_type, 
           COUNT(*) as count 
         FROM analytics_events 
         WHERE user_id = $1 
         GROUP BY event_type`,
        [userId]
      );
      
      // Get most viewed products
      const productViewsResult = await queryOptimizer.select(
        `SELECT 
           (data->>'product_id')::integer as product_id,
           COUNT(*) as view_count
         FROM analytics_events
         WHERE user_id = $1
         AND event_type = $2
         AND data->>'product_id' IS NOT NULL
         GROUP BY product_id
         ORDER BY view_count DESC
         LIMIT 5`,
        [userId, AnalyticsEventType.PRODUCT_VIEW]
      );
      
      // Get most searched terms
      const searchTermsResult = await queryOptimizer.select(
        `SELECT 
           data->>'query' as search_term,
           COUNT(*) as search_count
         FROM analytics_events
         WHERE user_id = $1
         AND event_type = $2
         AND data->>'query' IS NOT NULL
         GROUP BY search_term
         ORDER BY search_count DESC
         LIMIT 5`,
        [userId, AnalyticsEventType.SEARCH]
      );
      
      // Get most clicked external links
      const externalLinksResult = await queryOptimizer.select(
        `SELECT 
           data->>'url' as url,
           data->>'source' as source,
           COUNT(*) as click_count
         FROM analytics_events
         WHERE user_id = $1
         AND event_type = $2
         AND data->>'url' IS NOT NULL
         GROUP BY url, source
         ORDER BY click_count DESC
         LIMIT 5`,
        [userId, AnalyticsEventType.EXTERNAL_LINK_CLICK]
      );
      
      // Get activity over time
      const activityTimelineResult = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           COUNT(*) as event_count
         FROM analytics_events
         WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`,
        [userId]
      );
      
      // Combine results
      const analytics = {
        event_counts: eventCountsResult.rows.reduce((acc, row) => {
          acc[row.event_type] = parseInt(row.count);
          return acc;
        }, {}),
        most_viewed_products: productViewsResult.rows,
        most_searched_terms: searchTermsResult.rows,
        most_clicked_links: externalLinksResult.rows,
        activity_timeline: activityTimelineResult.rows
      };
      
      // Cache results
      await cacheService.set(cacheKey, analytics, CacheTTL.MEDIUM);
      
      return analytics;
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      return {
        event_counts: {},
        most_viewed_products: [],
        most_searched_terms: [],
        most_clicked_links: [],
        activity_timeline: [],
        error: error.message
      };
    }
  }
  
  /**
   * Get product analytics
   * @param productId - Product ID
   * @returns Product analytics data
   */
  async getProductAnalytics(productId: number): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:analytics`;
      
      // Try to get from cache
      const cachedAnalytics = await cacheService.get<any>(cacheKey);
      if (cachedAnalytics) {
        return cachedAnalytics;
      }
      
      // Get view count
      const viewCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as view_count
         FROM analytics_events
         WHERE event_type = $1
         AND (data->>'product_id')::integer = $2`,
        [AnalyticsEventType.PRODUCT_VIEW, productId]
      );
      
      // Get favorite count
      const favoriteCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as favorite_count
         FROM user_favorites
         WHERE product_id = $1`,
        [productId]
      );
      
      // Get external link clicks
      const externalClicksResult = await queryOptimizer.select(
        `SELECT 
           data->>'source' as source,
           COUNT(*) as click_count
         FROM analytics_events
         WHERE event_type = $1
         AND (data->>'product_id')::integer = $2
         AND data->>'source' IS NOT NULL
         GROUP BY source
         ORDER BY click_count DESC`,
        [AnalyticsEventType.EXTERNAL_LINK_CLICK, productId]
      );
      
      // Get view timeline
      const viewTimelineResult = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           COUNT(*) as view_count
         FROM analytics_events
         WHERE event_type = $1
         AND (data->>'product_id')::integer = $2
         AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`,
        [AnalyticsEventType.PRODUCT_VIEW, productId]
      );
      
      // Get comparison count
      const comparisonCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as comparison_count
         FROM analytics_events
         WHERE event_type = $1
         AND data->'product_ids' ? $2`,
        [AnalyticsEventType.COMPARISON_VIEW, productId.toString()]
      );
      
      // Combine results
      const analytics = {
        view_count: parseInt(viewCountResult.rows[0].view_count),
        favorite_count: parseInt(favoriteCountResult.rows[0].favorite_count),
        external_clicks: externalClicksResult.rows,
        view_timeline: viewTimelineResult.rows,
        comparison_count: parseInt(comparisonCountResult.rows[0].comparison_count)
      };
      
      // Cache results
      await cacheService.set(cacheKey, analytics, CacheTTL.MEDIUM);
      
      return analytics;
    } catch (error) {
      logger.error('Error getting product analytics:', error);
      return {
        view_count: 0,
        favorite_count: 0,
        external_clicks: [],
        view_timeline: [],
        comparison_count: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get site-wide analytics
   * @returns Site analytics data
   */
  async getSiteAnalytics(): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.SITE}analytics`;
      
      // Try to get from cache
      const cachedAnalytics = await cacheService.get<any>(cacheKey);
      if (cachedAnalytics) {
        return cachedAnalytics;
      }
      
      // Get total users
      const userCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as user_count FROM users`
      );
      
      // Get total products
      const productCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as product_count FROM products`
      );
      
      // Get total mentions
      const mentionCountResult = await queryOptimizer.select(
        `SELECT COUNT(*) as mention_count FROM product_mentions`
      );
      
      // Get event counts by type
      const eventCountsResult = await queryOptimizer.select(
        `SELECT 
           event_type, 
           COUNT(*) as count 
         FROM analytics_events 
         GROUP BY event_type`
      );
      
      // Get most viewed products
      const popularProductsResult = await queryOptimizer.select(
        `SELECT 
           p.id,
           p.name,
           COUNT(ae.id) as view_count
         FROM products p
         JOIN analytics_events ae ON (ae.data->>'product_id')::integer = p.id
         WHERE ae.event_type = $1
         GROUP BY p.id, p.name
         ORDER BY view_count DESC
         LIMIT 10`,
        [AnalyticsEventType.PRODUCT_VIEW]
      );
      
      // Get most searched terms
      const popularSearchesResult = await queryOptimizer.select(
        `SELECT 
           data->>'query' as search_term,
           COUNT(*) as search_count
         FROM analytics_events
         WHERE event_type = $1
         AND data->>'query' IS NOT NULL
         GROUP BY search_term
         ORDER BY search_count DESC
         LIMIT 10`,
        [AnalyticsEventType.SEARCH]
      );
      
      // Get daily active users
      const dauResult = await queryOptimizer.select(
        `SELECT COUNT(DISTINCT user_id) as dau
         FROM analytics_events
         WHERE created_at >= CURRENT_DATE
         AND user_id IS NOT NULL`
      );
      
      // Get monthly active users
      const mauResult = await queryOptimizer.select(
        `SELECT COUNT(DISTINCT user_id) as mau
         FROM analytics_events
         WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
         AND user_id IS NOT NULL`
      );
      
      // Get activity timeline
      const activityTimelineResult = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC('day', created_at) as date,
           COUNT(*) as event_count,
           COUNT(DISTINCT user_id) as user_count,
           COUNT(DISTINCT session_id) as session_count
         FROM analytics_events
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`
      );
      
      // Combine results
      const analytics = {
        user_count: parseInt(userCountResult.rows[0].user_count),
        product_count: parseInt(productCountResult.rows[0].product_count),
        mention_count: parseInt(mentionCountResult.rows[0].mention_count),
        event_counts: eventCountsResult.rows.reduce((acc, row) => {
          acc[row.event_type] = parseInt(row.count);
          return acc;
        }, {}),
        popular_products: popularProductsResult.rows,
        popular_searches: popularSearchesResult.rows,
        dau: parseInt(dauResult.rows[0].dau),
        mau: parseInt(mauResult.rows[0].mau),
        activity_timeline: activityTimelineResult.rows
      };
      
      // Cache results
      await cacheService.set(cacheKey, analytics, CacheTTL.SHORT);
      
      return analytics;
    } catch (error) {
      logger.error('Error getting site analytics:', error);
      return {
        user_count: 0,
        product_count: 0,
        mention_count: 0,
        event_counts: {},
        popular_products: [],
        popular_searches: [],
        dau: 0,
        mau: 0,
        activity_timeline: [],
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
