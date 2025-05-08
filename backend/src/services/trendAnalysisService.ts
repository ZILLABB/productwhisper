import { pool } from '../config/db';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';
import logger from './loggerService';
import { socketService, SocketEvent } from './socketService';
import { notificationService, NotificationType, NotificationPriority } from './notificationService';

/**
 * Time periods for trend analysis
 */
export enum TrendPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

/**
 * Trend types
 */
export enum TrendType {
  SENTIMENT = 'sentiment',
  MENTIONS = 'mentions',
  ASPECTS = 'aspects',
  SOURCES = 'sources'
}

/**
 * Trend direction
 */
export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

/**
 * Trend analysis service for analyzing product sentiment over time
 */
export class TrendAnalysisService {
  /**
   * Get sentiment trend for a product
   * @param productId - Product ID
   * @param period - Time period for trend analysis
   * @returns Sentiment trend data
   */
  async getSentimentTrend(productId: number, period: TrendPeriod = TrendPeriod.MONTH): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:sentiment:${period}`;
      
      // Try to get from cache
      const cachedTrend = await cacheService.get<any>(cacheKey);
      if (cachedTrend) {
        return cachedTrend;
      }
      
      // Get time interval based on period
      const interval = this.getPeriodInterval(period);
      
      // Get sentiment trend data
      const result = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC($1, pm.created_at) as time_period,
           AVG(pm.sentiment_score) as avg_sentiment,
           COUNT(pm.id) as mention_count
         FROM product_mentions pm
         WHERE pm.product_id = $2
         AND pm.created_at >= NOW() - INTERVAL '1 ${period}'
         GROUP BY time_period
         ORDER BY time_period ASC`,
        [interval, productId]
      );
      
      // Calculate trend direction
      const trendData = {
        product_id: productId,
        period,
        data_points: result.rows,
        trend_direction: this.calculateTrendDirection(result.rows.map(row => row.avg_sentiment)),
        average_sentiment: this.calculateAverage(result.rows.map(row => row.avg_sentiment)),
        total_mentions: result.rows.reduce((sum, row) => sum + parseInt(row.mention_count), 0)
      };
      
      // Cache results
      await cacheService.set(cacheKey, trendData, CacheTTL.MEDIUM);
      
      return trendData;
    } catch (error) {
      logger.error('Error getting sentiment trend:', error);
      return {
        product_id: productId,
        period,
        data_points: [],
        trend_direction: TrendDirection.STABLE,
        average_sentiment: 0,
        total_mentions: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get mention trend for a product
   * @param productId - Product ID
   * @param period - Time period for trend analysis
   * @returns Mention trend data
   */
  async getMentionTrend(productId: number, period: TrendPeriod = TrendPeriod.MONTH): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:mentions:${period}`;
      
      // Try to get from cache
      const cachedTrend = await cacheService.get<any>(cacheKey);
      if (cachedTrend) {
        return cachedTrend;
      }
      
      // Get time interval based on period
      const interval = this.getPeriodInterval(period);
      
      // Get mention trend data
      const result = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC($1, pm.created_at) as time_period,
           COUNT(pm.id) as mention_count,
           pm.source,
           AVG(pm.sentiment_score) as avg_sentiment
         FROM product_mentions pm
         WHERE pm.product_id = $2
         AND pm.created_at >= NOW() - INTERVAL '1 ${period}'
         GROUP BY time_period, pm.source
         ORDER BY time_period ASC, pm.source`,
        [interval, productId]
      );
      
      // Group by time period and source
      const dataByPeriod = {};
      const sources = new Set();
      
      result.rows.forEach(row => {
        const period = row.time_period;
        const source = row.source;
        
        sources.add(source);
        
        if (!dataByPeriod[period]) {
          dataByPeriod[period] = {};
        }
        
        dataByPeriod[period][source] = {
          count: parseInt(row.mention_count),
          sentiment: parseFloat(row.avg_sentiment)
        };
      });
      
      // Convert to array format
      const dataPoints = Object.keys(dataByPeriod).map(period => {
        const point = { time_period: period };
        
        sources.forEach(source => {
          if (dataByPeriod[period][source]) {
            point[`${source}_count`] = dataByPeriod[period][source].count;
            point[`${source}_sentiment`] = dataByPeriod[period][source].sentiment;
          } else {
            point[`${source}_count`] = 0;
            point[`${source}_sentiment`] = 0;
          }
        });
        
        // Add total count for the period
        point['total_count'] = Object.values(dataByPeriod[period]).reduce(
          (sum: number, data: any) => sum + data.count, 
          0
        );
        
        return point;
      });
      
      // Calculate total mentions
      const totalMentions = dataPoints.reduce(
        (sum, point) => sum + point.total_count, 
        0
      );
      
      // Calculate trend direction based on mention counts
      const trendDirection = this.calculateTrendDirection(
        dataPoints.map(point => point.total_count)
      );
      
      const trendData = {
        product_id: productId,
        period,
        data_points: dataPoints,
        sources: Array.from(sources),
        trend_direction: trendDirection,
        total_mentions: totalMentions
      };
      
      // Cache results
      await cacheService.set(cacheKey, trendData, CacheTTL.MEDIUM);
      
      return trendData;
    } catch (error) {
      logger.error('Error getting mention trend:', error);
      return {
        product_id: productId,
        period,
        data_points: [],
        sources: [],
        trend_direction: TrendDirection.STABLE,
        total_mentions: 0,
        error: error.message
      };
    }
  }
  
  /**
   * Get aspect trend for a product
   * @param productId - Product ID
   * @param period - Time period for trend analysis
   * @returns Aspect trend data
   */
  async getAspectTrend(productId: number, period: TrendPeriod = TrendPeriod.MONTH): Promise<any> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:trend:aspects:${period}`;
      
      // Try to get from cache
      const cachedTrend = await cacheService.get<any>(cacheKey);
      if (cachedTrend) {
        return cachedTrend;
      }
      
      // Get time interval based on period
      const interval = this.getPeriodInterval(period);
      
      // Get aspect trend data
      const result = await queryOptimizer.select(
        `SELECT 
           DATE_TRUNC($1, pma.created_at) as time_period,
           pma.aspect,
           AVG(pma.sentiment_score) as avg_sentiment,
           COUNT(pma.id) as mention_count
         FROM product_mention_aspects pma
         JOIN product_mentions pm ON pma.mention_id = pm.id
         WHERE pm.product_id = $2
         AND pma.created_at >= NOW() - INTERVAL '1 ${period}'
         GROUP BY time_period, pma.aspect
         ORDER BY time_period ASC, pma.aspect`,
        [interval, productId]
      );
      
      // Group by time period and aspect
      const dataByPeriod = {};
      const aspects = new Set();
      
      result.rows.forEach(row => {
        const period = row.time_period;
        const aspect = row.aspect;
        
        aspects.add(aspect);
        
        if (!dataByPeriod[period]) {
          dataByPeriod[period] = {};
        }
        
        dataByPeriod[period][aspect] = {
          count: parseInt(row.mention_count),
          sentiment: parseFloat(row.avg_sentiment)
        };
      });
      
      // Convert to array format
      const dataPoints = Object.keys(dataByPeriod).map(period => {
        const point = { time_period: period };
        
        aspects.forEach(aspect => {
          if (dataByPeriod[period][aspect]) {
            point[`${aspect}_count`] = dataByPeriod[period][aspect].count;
            point[`${aspect}_sentiment`] = dataByPeriod[period][aspect].sentiment;
          } else {
            point[`${aspect}_count`] = 0;
            point[`${aspect}_sentiment`] = 0;
          }
        });
        
        return point;
      });
      
      // Calculate aspect statistics
      const aspectStats = Array.from(aspects).map(aspect => {
        const aspectData = result.rows.filter(row => row.aspect === aspect);
        
        return {
          aspect,
          total_mentions: aspectData.reduce((sum, row) => sum + parseInt(row.mention_count), 0),
          average_sentiment: this.calculateAverage(aspectData.map(row => row.avg_sentiment)),
          trend_direction: this.calculateTrendDirection(
            dataPoints.map(point => point[`${aspect}_sentiment`] || 0)
          )
        };
      });
      
      const trendData = {
        product_id: productId,
        period,
        data_points: dataPoints,
        aspects: Array.from(aspects),
        aspect_stats: aspectStats
      };
      
      // Cache results
      await cacheService.set(cacheKey, trendData, CacheTTL.MEDIUM);
      
      return trendData;
    } catch (error) {
      logger.error('Error getting aspect trend:', error);
      return {
        product_id: productId,
        period,
        data_points: [],
        aspects: [],
        aspect_stats: [],
        error: error.message
      };
    }
  }
  
  /**
   * Detect significant trends and notify users
   * @param productId - Product ID
   */
  async detectAndNotifyTrends(productId: number): Promise<void> {
    try {
      // Get product details
      const productResult = await queryOptimizer.select(
        `SELECT id, name FROM products WHERE id = $1`,
        [productId]
      );
      
      if (productResult.rows.length === 0) {
        logger.warn(`Product not found for trend detection: ${productId}`);
        return;
      }
      
      const product = productResult.rows[0];
      
      // Get sentiment trend
      const sentimentTrend = await this.getSentimentTrend(productId, TrendPeriod.WEEK);
      
      // Get mention trend
      const mentionTrend = await this.getMentionTrend(productId, TrendPeriod.WEEK);
      
      // Check for significant trends
      const significantTrends = [];
      
      // Check sentiment trend
      if (sentimentTrend.trend_direction === TrendDirection.UP && sentimentTrend.average_sentiment > 0.3) {
        significantTrends.push({
          type: 'sentiment_positive',
          message: `${product.name} is trending positively in sentiment`
        });
      } else if (sentimentTrend.trend_direction === TrendDirection.DOWN && sentimentTrend.average_sentiment < -0.3) {
        significantTrends.push({
          type: 'sentiment_negative',
          message: `${product.name} is trending negatively in sentiment`
        });
      }
      
      // Check mention trend
      if (mentionTrend.trend_direction === TrendDirection.UP && mentionTrend.total_mentions > 10) {
        significantTrends.push({
          type: 'mentions_increase',
          message: `${product.name} is getting more mentions`
        });
      }
      
      // Notify users if significant trends found
      if (significantTrends.length > 0) {
        // Get users who have favorited this product
        const usersResult = await queryOptimizer.select(
          `SELECT user_id FROM user_favorites WHERE product_id = $1`,
          [productId]
        );
        
        const userIds = usersResult.rows.map(row => row.user_id);
        
        // Create notifications for each user
        for (const userId of userIds) {
          for (const trend of significantTrends) {
            await notificationService.createNotification({
              user_id: userId,
              type: NotificationType.PRODUCT_TRENDING,
              title: `Trend Alert: ${product.name}`,
              message: trend.message,
              data: {
                productId,
                productName: product.name,
                trendType: trend.type,
                sentimentTrend,
                mentionTrend
              },
              priority: NotificationPriority.MEDIUM,
              read: false
            });
          }
        }
        
        // Emit to product subscribers
        socketService.emitToProductSubscribers(
          productId,
          SocketEvent.PRODUCT_TRENDING,
          {
            productId,
            productName: product.name,
            trends: significantTrends,
            sentimentTrend,
            mentionTrend
          }
        );
        
        logger.info(`Notified users about trends for product ${productId}: ${product.name}`);
      }
    } catch (error) {
      logger.error('Error detecting and notifying trends:', error);
    }
  }
  
  /**
   * Get time interval for SQL DATE_TRUNC based on period
   * @private
   */
  private getPeriodInterval(period: TrendPeriod): string {
    switch (period) {
      case TrendPeriod.DAY:
        return 'hour';
      case TrendPeriod.WEEK:
        return 'day';
      case TrendPeriod.MONTH:
        return 'day';
      case TrendPeriod.QUARTER:
        return 'week';
      case TrendPeriod.YEAR:
        return 'month';
      default:
        return 'day';
    }
  }
  
  /**
   * Calculate trend direction from a series of values
   * @private
   */
  private calculateTrendDirection(values: number[]): TrendDirection {
    if (!values || values.length < 2) {
      return TrendDirection.STABLE;
    }
    
    // Filter out null/undefined values
    const filteredValues = values.filter(v => v !== null && v !== undefined);
    if (filteredValues.length < 2) {
      return TrendDirection.STABLE;
    }
    
    // Simple linear regression
    const n = filteredValues.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((sum, x) => sum + x, 0);
    const sumY = filteredValues.reduce((sum, y) => sum + y, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * filteredValues[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine trend direction based on slope
    if (slope > 0.05) {
      return TrendDirection.UP;
    } else if (slope < -0.05) {
      return TrendDirection.DOWN;
    } else {
      return TrendDirection.STABLE;
    }
  }
  
  /**
   * Calculate average of values
   * @private
   */
  private calculateAverage(values: number[]): number {
    if (!values || values.length === 0) {
      return 0;
    }
    
    // Filter out null/undefined values
    const filteredValues = values.filter(v => v !== null && v !== undefined);
    if (filteredValues.length === 0) {
      return 0;
    }
    
    return filteredValues.reduce((sum, value) => sum + value, 0) / filteredValues.length;
  }
}

// Export singleton instance
export const trendAnalysisService = new TrendAnalysisService();
