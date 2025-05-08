import { pool } from '../config/db';
import { socketService, SocketEvent } from './socketService';
import logger from './loggerService';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';

/**
 * Notification types
 */
export enum NotificationType {
  PRODUCT_MENTION = 'product_mention',
  PRODUCT_TRENDING = 'product_trending',
  PRODUCT_PRICE_DROP = 'product_price_drop',
  PRODUCT_REVIEW = 'product_review',
  FAVORITE_UPDATE = 'favorite_update',
  SYSTEM = 'system'
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Notification interface
 */
export interface Notification {
  id?: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  read: boolean;
  created_at: Date;
}

/**
 * Notification service for managing user notifications
 */
export class NotificationService {
  /**
   * Create a new notification
   * @param notification - Notification data
   * @returns Created notification
   */
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    try {
      // Insert notification into database
      const result = await queryOptimizer.insert(
        `INSERT INTO notifications 
         (user_id, type, title, message, data, priority, read) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          notification.user_id,
          notification.type,
          notification.title,
          notification.message,
          notification.data || null,
          notification.priority,
          notification.read
        ]
      );
      
      const createdNotification = result.rows[0];
      
      // Emit notification to user
      socketService.emitToUser(
        notification.user_id,
        SocketEvent.USER_NOTIFICATION,
        createdNotification
      );
      
      // Invalidate user notifications cache
      await cacheService.delete(`${CachePrefix.USER}${notification.user_id}:notifications`);
      
      return createdNotification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Get notifications for a user
   * @param userId - User ID
   * @param limit - Maximum number of notifications to return
   * @param offset - Number of notifications to skip
   * @param unreadOnly - Whether to return only unread notifications
   * @returns Notifications
   */
  async getUserNotifications(
    userId: number,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:notifications:${limit}:${offset}:${unreadOnly}`;
      
      // Try to get from cache
      const cachedNotifications = await cacheService.get<Notification[]>(cacheKey);
      if (cachedNotifications) {
        return cachedNotifications;
      }
      
      // Build query
      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `;
      
      const params = [userId];
      
      // Add unread filter if needed
      if (unreadOnly) {
        query += ` AND read = false`;
      }
      
      // Add order and pagination
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
      
      // Execute query
      const result = await queryOptimizer.select(query, params);
      
      // Cache results
      await cacheService.set(cacheKey, result.rows, CacheTTL.SHORT);
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   * @param userId - User ID (for security check)
   * @returns Updated notification
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification | null> {
    try {
      // Update notification
      const result = await queryOptimizer.update(
        `UPDATE notifications 
         SET read = true 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [notificationId, userId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const updatedNotification = result.rows[0];
      
      // Invalidate user notifications cache
      await cacheService.delete(`${CachePrefix.USER}${userId}:notifications`);
      
      return updatedNotification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Number of updated notifications
   */
  async markAllAsRead(userId: number): Promise<number> {
    try {
      // Update notifications
      const result = await queryOptimizer.update(
        `UPDATE notifications 
         SET read = true 
         WHERE user_id = $1 AND read = false 
         RETURNING id`,
        [userId]
      );
      
      // Invalidate user notifications cache
      await cacheService.delete(`${CachePrefix.USER}${userId}:notifications`);
      
      return result.rowCount;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @param userId - User ID (for security check)
   * @returns Whether the notification was deleted
   */
  async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
    try {
      // Delete notification
      const result = await queryOptimizer.delete(
        `DELETE FROM notifications 
         WHERE id = $1 AND user_id = $2 
         RETURNING id`,
        [notificationId, userId]
      );
      
      // Invalidate user notifications cache
      await cacheService.delete(`${CachePrefix.USER}${userId}:notifications`);
      
      return result.rowCount > 0;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  /**
   * Get unread notifications count for a user
   * @param userId - User ID
   * @returns Unread notifications count
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:notifications:unread_count`;
      
      // Try to get from cache
      const cachedCount = await cacheService.get<number>(cacheKey);
      if (cachedCount !== null) {
        return cachedCount;
      }
      
      // Execute query
      const result = await queryOptimizer.select(
        `SELECT COUNT(*) FROM notifications 
         WHERE user_id = $1 AND read = false`,
        [userId]
      );
      
      const count = parseInt(result.rows[0].count);
      
      // Cache result
      await cacheService.set(cacheKey, count, CacheTTL.SHORT);
      
      return count;
    } catch (error) {
      logger.error('Error getting unread notifications count:', error);
      throw error;
    }
  }
  
  /**
   * Notify users about a new product mention
   * @param productId - Product ID
   * @param productName - Product name
   * @param source - Mention source
   * @param mentionData - Mention data
   */
  async notifyProductMention(
    productId: number,
    productName: string,
    source: string,
    mentionData: any
  ): Promise<void> {
    try {
      // Get users who have favorited this product
      const result = await queryOptimizer.select(
        `SELECT user_id FROM user_favorites WHERE product_id = $1`,
        [productId]
      );
      
      const userIds = result.rows.map(row => row.user_id);
      
      // Create notifications for each user
      for (const userId of userIds) {
        await this.createNotification({
          user_id: userId,
          type: NotificationType.PRODUCT_MENTION,
          title: `New mention of ${productName}`,
          message: `${productName} was mentioned on ${source}`,
          data: {
            productId,
            productName,
            source,
            mentionData
          },
          priority: NotificationPriority.MEDIUM,
          read: false
        });
      }
      
      // Emit to product subscribers
      socketService.emitToProductSubscribers(
        productId,
        SocketEvent.PRODUCT_MENTIONED,
        {
          productId,
          productName,
          source,
          mentionData
        }
      );
    } catch (error) {
      logger.error('Error notifying product mention:', error);
    }
  }
  
  /**
   * Notify users about a trending product
   * @param productId - Product ID
   * @param productName - Product name
   * @param trendData - Trend data
   */
  async notifyTrendingProduct(
    productId: number,
    productName: string,
    trendData: any
  ): Promise<void> {
    try {
      // Get users who have favorited this product
      const result = await queryOptimizer.select(
        `SELECT user_id FROM user_favorites WHERE product_id = $1`,
        [productId]
      );
      
      const userIds = result.rows.map(row => row.user_id);
      
      // Create notifications for each user
      for (const userId of userIds) {
        await this.createNotification({
          user_id: userId,
          type: NotificationType.PRODUCT_TRENDING,
          title: `${productName} is trending!`,
          message: `${productName} is gaining popularity across platforms`,
          data: {
            productId,
            productName,
            trendData
          },
          priority: NotificationPriority.HIGH,
          read: false
        });
      }
      
      // Emit to product subscribers
      socketService.emitToProductSubscribers(
        productId,
        SocketEvent.PRODUCT_TRENDING,
        {
          productId,
          productName,
          trendData
        }
      );
    } catch (error) {
      logger.error('Error notifying trending product:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
