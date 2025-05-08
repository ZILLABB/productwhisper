import { redisClient } from '../config/redis';

/**
 * Cache TTL values in seconds
 */
export enum CacheTTL {
  SHORT = 60, // 1 minute
  MEDIUM = 300, // 5 minutes
  LONG = 3600, // 1 hour
  VERY_LONG = 86400, // 1 day
}

/**
 * Cache prefixes for different types of data
 */
export enum CachePrefix {
  PRODUCT = 'product:',
  SEARCH = 'search:',
  USER = 'user:',
  EXTERNAL_API = 'external:',
  SENTIMENT = 'sentiment:',
}

/**
 * Cache Service for Redis
 */
export class CacheService {
  /**
   * Get data from cache
   * @param key - Cache key
   * @returns Cached data or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in seconds
   * @returns Success status
   */
  async set(key: string, data: any, ttl: number = CacheTTL.MEDIUM): Promise<boolean> {
    try {
      await redisClient.set(key, JSON.stringify(data), {
        EX: ttl
      });
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete data from cache
   * @param key - Cache key
   * @returns Success status
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   * @param pattern - Key pattern to match
   * @returns Number of keys deleted
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      // This is a simplified implementation
      // In a real Redis implementation, you would use SCAN and DEL commands
      console.log(`Would delete keys matching pattern: ${pattern}`);
      return 0;
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Get or set cache
   * @param key - Cache key
   * @param fetchData - Function to fetch data if not in cache
   * @param ttl - Time to live in seconds
   * @returns Cached or fetched data
   */
  async getOrSet<T>(
    key: string,
    fetchData: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = await this.get<T>(key);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in cache, fetch data
    const data = await fetchData();
    
    // Cache the fetched data
    await this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Invalidate cache for a product
   * @param productId - Product ID
   * @returns Success status
   */
  async invalidateProduct(productId: number): Promise<boolean> {
    try {
      // Delete product detail cache
      await this.delete(`${CachePrefix.PRODUCT}${productId}`);
      
      // Delete any search results that might contain this product
      await this.deletePattern(`${CachePrefix.SEARCH}*`);
      
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  /**
   * Invalidate all search caches
   * @returns Success status
   */
  async invalidateSearches(): Promise<boolean> {
    try {
      await this.deletePattern(`${CachePrefix.SEARCH}*`);
      return true;
    } catch (error) {
      console.error('Search cache invalidation error:', error);
      return false;
    }
  }

  /**
   * Invalidate user-related caches
   * @param userId - User ID
   * @returns Success status
   */
  async invalidateUser(userId: number): Promise<boolean> {
    try {
      await this.delete(`${CachePrefix.USER}${userId}`);
      return true;
    } catch (error) {
      console.error('User cache invalidation error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
