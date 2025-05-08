import { pool } from '../config/db';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';
import logger from './loggerService';

/**
 * Recommendation types
 */
export enum RecommendationType {
  SIMILAR_PRODUCTS = 'similar_products',
  BASED_ON_FAVORITES = 'based_on_favorites',
  BASED_ON_SEARCHES = 'based_on_searches',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized'
}

/**
 * Recommendation service for personalized product recommendations
 */
export class RecommendationService {
  /**
   * Get similar products to a given product
   * @param productId - Product ID
   * @param limit - Maximum number of recommendations to return
   * @returns Similar products
   */
  async getSimilarProducts(productId: number, limit: number = 5): Promise<any[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}${productId}:similar:${limit}`;
      
      // Try to get from cache
      const cachedRecommendations = await cacheService.get<any[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
      
      // Get product details
      const productResult = await queryOptimizer.select(
        `SELECT category, brand, tags FROM products p
         LEFT JOIN (
           SELECT product_id, ARRAY_AGG(t.name) as tags
           FROM product_tags pt
           JOIN tags t ON pt.tag_id = t.id
           GROUP BY product_id
         ) pt ON p.id = pt.product_id
         WHERE p.id = $1`,
        [productId]
      );
      
      if (productResult.rows.length === 0) {
        return [];
      }
      
      const product = productResult.rows[0];
      
      // Find similar products based on category, brand, and tags
      const result = await queryOptimizer.select(
        `SELECT p.*, ps.overall_score, ps.confidence_score,
         ARRAY_AGG(DISTINCT t.name) as tags,
         ARRAY_AGG(DISTINCT pm.source) as sources
         FROM products p
         LEFT JOIN product_scores ps ON p.id = ps.product_id
         LEFT JOIN product_mentions pm ON p.id = pm.product_id
         LEFT JOIN product_tags pt ON p.id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         WHERE p.id != $1
         AND (
           p.category = $2
           OR p.brand = $3
           OR EXISTS (
             SELECT 1 FROM product_tags pt2
             JOIN tags t2 ON pt2.tag_id = t2.id
             WHERE pt2.product_id = p.id
             AND t2.name = ANY($4)
           )
         )
         GROUP BY p.id, ps.id
         ORDER BY 
           CASE WHEN p.category = $2 THEN 1 ELSE 0 END +
           CASE WHEN p.brand = $3 THEN 1 ELSE 0 END +
           (
             SELECT COUNT(*)
             FROM product_tags pt3
             JOIN tags t3 ON pt3.tag_id = t3.id
             WHERE pt3.product_id = p.id
             AND t3.name = ANY($4)
           ) DESC,
           ps.overall_score DESC NULLS LAST
         LIMIT $5`,
        [
          productId,
          product.category,
          product.brand,
          product.tags || [],
          limit
        ]
      );
      
      // Transform results
      const recommendations = result.rows.map(row => {
        const { 
          overall_score, confidence_score, tags, sources,
          ...productData 
        } = row;
        
        return {
          ...productData,
          score: overall_score,
          confidence: confidence_score,
          tags: tags.filter((tag: string | null) => tag !== null),
          sources: sources.filter((source: string | null) => source !== null)
        };
      });
      
      // Cache results
      await cacheService.set(cacheKey, recommendations, CacheTTL.LONG);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting similar products:', error);
      return [];
    }
  }
  
  /**
   * Get recommendations based on user favorites
   * @param userId - User ID
   * @param limit - Maximum number of recommendations to return
   * @returns Recommended products
   */
  async getRecommendationsFromFavorites(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:recommendations:favorites:${limit}`;
      
      // Try to get from cache
      const cachedRecommendations = await cacheService.get<any[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
      
      // Get user's favorite products
      const favoritesResult = await queryOptimizer.select(
        `SELECT product_id FROM user_favorites WHERE user_id = $1`,
        [userId]
      );
      
      if (favoritesResult.rows.length === 0) {
        return [];
      }
      
      const favoriteIds = favoritesResult.rows.map(row => row.product_id);
      
      // Get categories, brands, and tags from user's favorites
      const attributesResult = await queryOptimizer.select(
        `SELECT 
           ARRAY_AGG(DISTINCT p.category) as categories,
           ARRAY_AGG(DISTINCT p.brand) as brands,
           ARRAY_AGG(DISTINCT t.name) as tags
         FROM products p
         LEFT JOIN product_tags pt ON p.id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         WHERE p.id = ANY($1)`,
        [favoriteIds]
      );
      
      const attributes = attributesResult.rows[0];
      
      // Find similar products based on categories, brands, and tags
      const result = await queryOptimizer.select(
        `SELECT p.*, ps.overall_score, ps.confidence_score,
         ARRAY_AGG(DISTINCT t.name) as tags,
         ARRAY_AGG(DISTINCT pm.source) as sources
         FROM products p
         LEFT JOIN product_scores ps ON p.id = ps.product_id
         LEFT JOIN product_mentions pm ON p.id = pm.product_id
         LEFT JOIN product_tags pt ON p.id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         WHERE p.id != ALL($1)
         AND (
           p.category = ANY($2)
           OR p.brand = ANY($3)
           OR EXISTS (
             SELECT 1 FROM product_tags pt2
             JOIN tags t2 ON pt2.tag_id = t2.id
             WHERE pt2.product_id = p.id
             AND t2.name = ANY($4)
           )
         )
         GROUP BY p.id, ps.id
         ORDER BY 
           CASE WHEN p.category = ANY($2) THEN 1 ELSE 0 END +
           CASE WHEN p.brand = ANY($3) THEN 1 ELSE 0 END +
           (
             SELECT COUNT(*)
             FROM product_tags pt3
             JOIN tags t3 ON pt3.tag_id = t3.id
             WHERE pt3.product_id = p.id
             AND t3.name = ANY($4)
           ) DESC,
           ps.overall_score DESC NULLS LAST
         LIMIT $5`,
        [
          favoriteIds,
          attributes.categories || [],
          attributes.brands || [],
          attributes.tags || [],
          limit
        ]
      );
      
      // Transform results
      const recommendations = result.rows.map(row => {
        const { 
          overall_score, confidence_score, tags, sources,
          ...productData 
        } = row;
        
        return {
          ...productData,
          score: overall_score,
          confidence: confidence_score,
          tags: tags.filter((tag: string | null) => tag !== null),
          sources: sources.filter((source: string | null) => source !== null),
          recommendation_type: RecommendationType.BASED_ON_FAVORITES
        };
      });
      
      // Cache results
      await cacheService.set(cacheKey, recommendations, CacheTTL.MEDIUM);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations from favorites:', error);
      return [];
    }
  }
  
  /**
   * Get recommendations based on user searches
   * @param userId - User ID
   * @param limit - Maximum number of recommendations to return
   * @returns Recommended products
   */
  async getRecommendationsFromSearches(userId: number, limit: number = 10): Promise<any[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:recommendations:searches:${limit}`;
      
      // Try to get from cache
      const cachedRecommendations = await cacheService.get<any[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
      
      // Get user's recent searches
      const searchesResult = await queryOptimizer.select(
        `SELECT query FROM user_searches 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId]
      );
      
      if (searchesResult.rows.length === 0) {
        return [];
      }
      
      const searchQueries = searchesResult.rows.map(row => row.query);
      
      // Find products matching search queries
      const result = await queryOptimizer.select(
        `SELECT p.*, ps.overall_score, ps.confidence_score,
         ARRAY_AGG(DISTINCT t.name) as tags,
         ARRAY_AGG(DISTINCT pm.source) as sources
         FROM products p
         LEFT JOIN product_scores ps ON p.id = ps.product_id
         LEFT JOIN product_mentions pm ON p.id = pm.product_id
         LEFT JOIN product_tags pt ON p.id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         WHERE 
           p.id NOT IN (
             SELECT product_id FROM user_favorites WHERE user_id = $1
           )
           AND (
             ${searchQueries.map((_, i) => `p.name ILIKE $${i + 3} OR p.description ILIKE $${i + 3}`).join(' OR ')}
           )
         GROUP BY p.id, ps.id
         ORDER BY ps.overall_score DESC NULLS LAST
         LIMIT $2`,
        [
          userId,
          limit,
          ...searchQueries.map(query => `%${query}%`)
        ]
      );
      
      // Transform results
      const recommendations = result.rows.map(row => {
        const { 
          overall_score, confidence_score, tags, sources,
          ...productData 
        } = row;
        
        return {
          ...productData,
          score: overall_score,
          confidence: confidence_score,
          tags: tags.filter((tag: string | null) => tag !== null),
          sources: sources.filter((source: string | null) => source !== null),
          recommendation_type: RecommendationType.BASED_ON_SEARCHES
        };
      });
      
      // Cache results
      await cacheService.set(cacheKey, recommendations, CacheTTL.MEDIUM);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting recommendations from searches:', error);
      return [];
    }
  }
  
  /**
   * Get trending products
   * @param limit - Maximum number of recommendations to return
   * @returns Trending products
   */
  async getTrendingProducts(limit: number = 10): Promise<any[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}trending:${limit}`;
      
      // Try to get from cache
      const cachedRecommendations = await cacheService.get<any[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
      
      // Get trending products based on recent mentions and high scores
      const result = await queryOptimizer.select(
        `SELECT p.*, ps.overall_score, ps.confidence_score,
         ARRAY_AGG(DISTINCT t.name) as tags,
         ARRAY_AGG(DISTINCT pm.source) as sources,
         COUNT(pm.id) as mention_count
         FROM products p
         JOIN product_scores ps ON p.id = ps.product_id
         JOIN product_mentions pm ON p.id = pm.product_id
         LEFT JOIN product_tags pt ON p.id = pt.product_id
         LEFT JOIN tags t ON pt.tag_id = t.id
         WHERE pm.created_at > NOW() - INTERVAL '7 days'
         GROUP BY p.id, ps.id
         ORDER BY 
           mention_count DESC,
           ps.overall_score DESC
         LIMIT $1`,
        [limit]
      );
      
      // Transform results
      const recommendations = result.rows.map(row => {
        const { 
          overall_score, confidence_score, tags, sources, mention_count,
          ...productData 
        } = row;
        
        return {
          ...productData,
          score: overall_score,
          confidence: confidence_score,
          tags: tags.filter((tag: string | null) => tag !== null),
          sources: sources.filter((source: string | null) => source !== null),
          mention_count,
          recommendation_type: RecommendationType.TRENDING
        };
      });
      
      // Cache results
      await cacheService.set(cacheKey, recommendations, CacheTTL.SHORT);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting trending products:', error);
      return [];
    }
  }
  
  /**
   * Get personalized recommendations for a user
   * @param userId - User ID
   * @param limit - Maximum number of recommendations to return
   * @returns Personalized recommendations
   */
  async getPersonalizedRecommendations(userId: number, limit: number = 20): Promise<any[]> {
    try {
      // Create cache key
      const cacheKey = `${CachePrefix.USER}${userId}:recommendations:personalized:${limit}`;
      
      // Try to get from cache
      const cachedRecommendations = await cacheService.get<any[]>(cacheKey);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }
      
      // Get recommendations from different sources
      const [
        favoritesRecommendations,
        searchesRecommendations,
        trendingRecommendations
      ] = await Promise.all([
        this.getRecommendationsFromFavorites(userId, Math.ceil(limit * 0.4)),
        this.getRecommendationsFromSearches(userId, Math.ceil(limit * 0.3)),
        this.getTrendingProducts(Math.ceil(limit * 0.3))
      ]);
      
      // Combine recommendations
      const allRecommendations = [
        ...favoritesRecommendations,
        ...searchesRecommendations,
        ...trendingRecommendations
      ];
      
      // Remove duplicates
      const uniqueRecommendations = allRecommendations.filter(
        (recommendation, index, self) =>
          index === self.findIndex(r => r.id === recommendation.id)
      );
      
      // Limit results
      const recommendations = uniqueRecommendations.slice(0, limit);
      
      // Cache results
      await cacheService.set(cacheKey, recommendations, CacheTTL.MEDIUM);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
