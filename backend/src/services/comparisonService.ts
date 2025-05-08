import { pool } from '../config/db';
import { queryOptimizer } from './queryOptimizer';
import { cacheService, CachePrefix, CacheTTL } from './cacheService';
import logger from './loggerService';

/**
 * Comparison category
 */
export enum ComparisonCategory {
  OVERALL = 'overall',
  SENTIMENT = 'sentiment',
  FEATURES = 'features',
  PRICE = 'price',
  MENTIONS = 'mentions'
}

/**
 * Comparison service for comparing products
 */
export class ComparisonService {
  /**
   * Compare products
   * @param productIds - Array of product IDs to compare
   * @returns Comparison data
   */
  async compareProducts(productIds: number[]): Promise<any> {
    try {
      if (!productIds || productIds.length < 2) {
        return {
          error: 'At least two products are required for comparison'
        };
      }
      
      // Sort product IDs for consistent caching
      const sortedProductIds = [...productIds].sort((a, b) => a - b);
      
      // Create cache key
      const cacheKey = `${CachePrefix.PRODUCT}compare:${sortedProductIds.join('-')}`;
      
      // Try to get from cache
      const cachedComparison = await cacheService.get<any>(cacheKey);
      if (cachedComparison) {
        return cachedComparison;
      }
      
      // Get product details
      const productsResult = await queryOptimizer.select(
        `SELECT 
           p.*,
           ps.overall_score, ps.reddit_score, ps.amazon_score, ps.youtube_score,
           ps.confidence_score, ps.sample_size
         FROM products p
         LEFT JOIN product_scores ps ON p.id = ps.product_id
         WHERE p.id = ANY($1)`,
        [sortedProductIds]
      );
      
      if (productsResult.rows.length !== sortedProductIds.length) {
        return {
          error: 'One or more products not found'
        };
      }
      
      // Get product tags
      const tagsResult = await queryOptimizer.select(
        `SELECT pt.product_id, ARRAY_AGG(t.name) as tags
         FROM product_tags pt
         JOIN tags t ON pt.tag_id = t.id
         WHERE pt.product_id = ANY($1)
         GROUP BY pt.product_id`,
        [sortedProductIds]
      );
      
      // Create a map of product ID to tags
      const tagMap = {};
      tagsResult.rows.forEach(row => {
        tagMap[row.product_id] = row.tags;
      });
      
      // Get product mentions
      const mentionsResult = await queryOptimizer.select(
        `SELECT 
           pm.product_id,
           COUNT(pm.id) as mention_count,
           AVG(pm.sentiment_score) as avg_sentiment,
           ARRAY_AGG(DISTINCT pm.source) as sources
         FROM product_mentions pm
         WHERE pm.product_id = ANY($1)
         GROUP BY pm.product_id`,
        [sortedProductIds]
      );
      
      // Create a map of product ID to mentions
      const mentionMap = {};
      mentionsResult.rows.forEach(row => {
        mentionMap[row.product_id] = {
          count: parseInt(row.mention_count),
          sentiment: parseFloat(row.avg_sentiment),
          sources: row.sources
        };
      });
      
      // Get product aspects
      const aspectsResult = await queryOptimizer.select(
        `SELECT 
           pm.product_id,
           pma.aspect,
           COUNT(pma.id) as mention_count,
           AVG(pma.sentiment_score) as avg_sentiment
         FROM product_mention_aspects pma
         JOIN product_mentions pm ON pma.mention_id = pm.id
         WHERE pm.product_id = ANY($1)
         GROUP BY pm.product_id, pma.aspect`,
        [sortedProductIds]
      );
      
      // Create a map of product ID to aspects
      const aspectMap = {};
      aspectsResult.rows.forEach(row => {
        if (!aspectMap[row.product_id]) {
          aspectMap[row.product_id] = {};
        }
        
        aspectMap[row.product_id][row.aspect] = {
          count: parseInt(row.mention_count),
          sentiment: parseFloat(row.avg_sentiment)
        };
      });
      
      // Transform product data
      const products = productsResult.rows.map(row => {
        const { 
          overall_score, reddit_score, amazon_score, youtube_score,
          confidence_score, sample_size,
          ...productData 
        } = row;
        
        return {
          ...productData,
          scores: {
            overall: overall_score,
            reddit: reddit_score,
            amazon: amazon_score,
            youtube: youtube_score,
            confidence: confidence_score,
            sample_size: sample_size
          },
          tags: tagMap[row.id] || [],
          mentions: mentionMap[row.id] || { count: 0, sentiment: 0, sources: [] },
          aspects: aspectMap[row.id] || {}
        };
      });
      
      // Generate comparison data
      const comparisonData = this.generateComparisonData(products);
      
      // Cache results
      await cacheService.set(cacheKey, comparisonData, CacheTTL.MEDIUM);
      
      return comparisonData;
    } catch (error) {
      logger.error('Error comparing products:', error);
      return {
        error: 'Error comparing products: ' + error.message
      };
    }
  }
  
  /**
   * Generate comparison data from product data
   * @private
   */
  private generateComparisonData(products: any[]): any {
    // Get all unique aspects across all products
    const allAspects = new Set<string>();
    products.forEach(product => {
      Object.keys(product.aspects).forEach(aspect => {
        allAspects.add(aspect);
      });
    });
    
    // Generate comparison categories
    const categories = {
      [ComparisonCategory.OVERALL]: {
        title: 'Overall Comparison',
        metrics: [
          {
            name: 'overall_score',
            title: 'Overall Score',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.overall || 0,
              display: `${((p.scores.overall || 0) * 5).toFixed(1)}/5`
            })),
            winner: this.getWinner(products, p => p.scores.overall || 0)
          },
          {
            name: 'confidence_score',
            title: 'Confidence Score',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.confidence || 0,
              display: `${((p.scores.confidence || 0) * 100).toFixed(0)}%`
            })),
            winner: this.getWinner(products, p => p.scores.confidence || 0)
          },
          {
            name: 'sample_size',
            title: 'Sample Size',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.sample_size || 0,
              display: `${p.scores.sample_size || 0}`
            })),
            winner: this.getWinner(products, p => p.scores.sample_size || 0)
          },
          {
            name: 'price',
            title: 'Price',
            values: products.map(p => ({
              product_id: p.id,
              value: p.price || 0,
              display: `$${p.price ? p.price.toFixed(2) : '0.00'}`
            })),
            winner: this.getWinner(products, p => -(p.price || 0)) // Lower price is better
          }
        ]
      },
      [ComparisonCategory.SENTIMENT]: {
        title: 'Sentiment Analysis',
        metrics: [
          {
            name: 'reddit_score',
            title: 'Reddit Sentiment',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.reddit || 0,
              display: `${((p.scores.reddit || 0) * 5).toFixed(1)}/5`
            })),
            winner: this.getWinner(products, p => p.scores.reddit || 0)
          },
          {
            name: 'amazon_score',
            title: 'Amazon Sentiment',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.amazon || 0,
              display: `${((p.scores.amazon || 0) * 5).toFixed(1)}/5`
            })),
            winner: this.getWinner(products, p => p.scores.amazon || 0)
          },
          {
            name: 'youtube_score',
            title: 'YouTube Sentiment',
            values: products.map(p => ({
              product_id: p.id,
              value: p.scores.youtube || 0,
              display: `${((p.scores.youtube || 0) * 5).toFixed(1)}/5`
            })),
            winner: this.getWinner(products, p => p.scores.youtube || 0)
          },
          {
            name: 'mention_sentiment',
            title: 'Mention Sentiment',
            values: products.map(p => ({
              product_id: p.id,
              value: p.mentions.sentiment || 0,
              display: `${((p.mentions.sentiment || 0) * 5).toFixed(1)}/5`
            })),
            winner: this.getWinner(products, p => p.mentions.sentiment || 0)
          }
        ]
      },
      [ComparisonCategory.FEATURES]: {
        title: 'Feature Comparison',
        metrics: Array.from(allAspects).map(aspect => ({
          name: aspect,
          title: this.formatAspectName(aspect),
          values: products.map(p => ({
            product_id: p.id,
            value: p.aspects[aspect] ? p.aspects[aspect].sentiment : null,
            display: p.aspects[aspect] 
              ? `${((p.aspects[aspect].sentiment || 0) * 5).toFixed(1)}/5`
              : 'N/A'
          })),
          winner: this.getWinner(
            products.filter(p => p.aspects[aspect]), 
            p => p.aspects[aspect] ? p.aspects[aspect].sentiment : -Infinity
          )
        }))
      },
      [ComparisonCategory.MENTIONS]: {
        title: 'Mention Statistics',
        metrics: [
          {
            name: 'mention_count',
            title: 'Total Mentions',
            values: products.map(p => ({
              product_id: p.id,
              value: p.mentions.count || 0,
              display: `${p.mentions.count || 0}`
            })),
            winner: this.getWinner(products, p => p.mentions.count || 0)
          },
          {
            name: 'source_count',
            title: 'Source Count',
            values: products.map(p => ({
              product_id: p.id,
              value: (p.mentions.sources || []).length,
              display: `${(p.mentions.sources || []).length}`
            })),
            winner: this.getWinner(products, p => (p.mentions.sources || []).length)
          }
        ]
      }
    };
    
    // Calculate overall winners
    const winners = {
      [ComparisonCategory.OVERALL]: this.getCategoryWinner(categories[ComparisonCategory.OVERALL]),
      [ComparisonCategory.SENTIMENT]: this.getCategoryWinner(categories[ComparisonCategory.SENTIMENT]),
      [ComparisonCategory.FEATURES]: this.getCategoryWinner(categories[ComparisonCategory.FEATURES]),
      [ComparisonCategory.MENTIONS]: this.getCategoryWinner(categories[ComparisonCategory.MENTIONS])
    };
    
    // Calculate overall winner
    const overallWinner = this.getOverallWinner(winners);
    
    return {
      products,
      categories,
      winners,
      overall_winner: overallWinner
    };
  }
  
  /**
   * Get winner for a specific metric
   * @private
   */
  private getWinner(products: any[], valueFn: (product: any) => number): any {
    if (!products || products.length === 0) {
      return null;
    }
    
    let maxValue = -Infinity;
    let winner = null;
    
    products.forEach(product => {
      const value = valueFn(product);
      if (value !== null && value !== undefined && value > maxValue) {
        maxValue = value;
        winner = product.id;
      }
    });
    
    return winner;
  }
  
  /**
   * Get winner for a category
   * @private
   */
  private getCategoryWinner(category: any): any {
    if (!category || !category.metrics || category.metrics.length === 0) {
      return null;
    }
    
    // Count wins per product
    const winCounts = {};
    
    category.metrics.forEach(metric => {
      if (metric.winner) {
        winCounts[metric.winner] = (winCounts[metric.winner] || 0) + 1;
      }
    });
    
    // Find product with most wins
    let maxWins = 0;
    let winner = null;
    
    Object.entries(winCounts).forEach(([productId, count]) => {
      if (count > maxWins) {
        maxWins = count as number;
        winner = parseInt(productId);
      }
    });
    
    return winner;
  }
  
  /**
   * Get overall winner across all categories
   * @private
   */
  private getOverallWinner(winners: any): any {
    // Count category wins per product
    const winCounts = {};
    
    Object.values(winners).forEach(productId => {
      if (productId) {
        winCounts[productId] = (winCounts[productId] || 0) + 1;
      }
    });
    
    // Find product with most category wins
    let maxWins = 0;
    let winner = null;
    
    Object.entries(winCounts).forEach(([productId, count]) => {
      if (count > maxWins) {
        maxWins = count as number;
        winner = parseInt(productId);
      }
    });
    
    return winner;
  }
  
  /**
   * Format aspect name for display
   * @private
   */
  private formatAspectName(aspect: string): string {
    return aspect
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Export singleton instance
export const comparisonService = new ComparisonService();
