import axios from 'axios';
import { redisClient } from '../../config/redis';

// Cache keys
const YOUTUBE_CACHE_PREFIX = 'youtube:search:';
const YOUTUBE_CACHE_TTL = 43200; // 12 hours

/**
 * YouTube API Service
 */
export class YouTubeService {
  private apiKey: string;

  constructor() {
    // Load API key from environment variables
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  /**
   * Search YouTube for product reviews
   */
  async searchProducts(query: string, limit: number = 10): Promise<any[]> {
    // Check cache first
    const cacheKey = `${YOUTUBE_CACHE_PREFIX}${query}:${limit}`;
    const cachedResults = await redisClient.get(cacheKey);
    
    if (cachedResults) {
      console.log('Returning cached YouTube results for:', query);
      return JSON.parse(cachedResults);
    }

    try {
      // Check if API key is configured
      if (!this.apiKey) {
        console.warn('YouTube API key not configured');
        return [];
      }

      // Search for videos
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${query} review`,
          type: 'video',
          maxResults: limit,
          order: 'relevance',
          videoDefinition: 'high',
          key: this.apiKey
        }
      });

      // Get video IDs
      const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId);
      
      // Get video details
      const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: this.apiKey
        }
      });

      // Process results
      const results = [];
      
      for (const item of videoResponse.data.items) {
        // Extract product name from title
        const productName = this.extractProductName(item.snippet.title, query);
        
        if (productName) {
          results.push({
            source: 'youtube',
            source_id: item.id,
            product_name: productName,
            content: item.snippet.title,
            description: item.snippet.description,
            url: `https://youtube.com/watch?v=${item.id}`,
            created_at: new Date(item.snippet.publishedAt),
            statistics: {
              views: parseInt(item.statistics.viewCount),
              likes: parseInt(item.statistics.likeCount),
              comments: parseInt(item.statistics.commentCount)
            }
          });
        }
      }
      
      // Cache results
      await redisClient.set(cacheKey, JSON.stringify(results), {
        EX: YOUTUBE_CACHE_TTL
      });
      
      return results;
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  /**
   * Get comments for a video
   */
  async getVideoComments(videoId: string, limit: number = 20): Promise<any[]> {
    // Check cache first
    const cacheKey = `youtube:comments:${videoId}:${limit}`;
    const cachedResults = await redisClient.get(cacheKey);
    
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }

    try {
      // Check if API key is configured
      if (!this.apiKey) {
        console.warn('YouTube API key not configured');
        return [];
      }

      // Get comments
      const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: limit,
          order: 'relevance',
          key: this.apiKey
        }
      });

      // Process comments
      const comments = response.data.items.map((item: any) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: item.snippet.topLevelComment.snippet.likeCount,
        published_at: new Date(item.snippet.topLevelComment.snippet.publishedAt)
      }));
      
      // Cache results
      await redisClient.set(cacheKey, JSON.stringify(comments), {
        EX: YOUTUBE_CACHE_TTL
      });
      
      return comments;
    } catch (error) {
      console.error('YouTube comments error:', error);
      return [];
    }
  }

  /**
   * Extract product name from video title
   */
  private extractProductName(title: string, query: string): string | null {
    // Simple extraction logic - can be improved with NLP
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (titleLower.includes(queryLower)) {
      // Look for patterns like "Product Name Review" or "Review: Product Name"
      const reviewIndex = titleLower.indexOf('review');
      
      if (reviewIndex !== -1) {
        // If "review" is found, extract text before or after it
        if (reviewIndex > queryLower.length) {
          // Extract before "review"
          const beforeReview = title.substring(0, reviewIndex).trim();
          if (beforeReview.toLowerCase().includes(queryLower)) {
            // Find the start of the product name
            const productStart = beforeReview.toLowerCase().indexOf(queryLower);
            // Extract a reasonable length for the product name
            return beforeReview.substring(productStart, Math.min(beforeReview.length, productStart + queryLower.length + 20));
          }
        } else {
          // Extract after "review:" or similar
          const afterReview = title.substring(reviewIndex + 7).trim();
          if (afterReview.toLowerCase().includes(queryLower)) {
            // Find the start of the product name
            const productStart = afterReview.toLowerCase().indexOf(queryLower);
            // Extract a reasonable length for the product name
            return afterReview.substring(productStart, Math.min(afterReview.length, productStart + queryLower.length + 20));
          }
        }
      }
      
      // If no review pattern found, just return the query with some context
      return `${query} ${titleLower.includes('pro') ? 'Pro' : titleLower.includes('ultra') ? 'Ultra' : ''}`.trim();
    }
    
    return null;
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();
