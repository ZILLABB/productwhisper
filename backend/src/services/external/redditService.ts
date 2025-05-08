import axios from 'axios';
import { redisClient } from '../../config/redis';

// Cache keys
const REDDIT_CACHE_PREFIX = 'reddit:search:';
const REDDIT_CACHE_TTL = 3600; // 1 hour

/**
 * Reddit API Service
 */
export class RedditService {
  private userAgent: string;
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Load credentials from environment variables
    this.userAgent = process.env.REDDIT_USER_AGENT || 'ProductWhisper/1.0';
    this.clientId = process.env.REDDIT_CLIENT_ID || '';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    this.username = process.env.REDDIT_USERNAME || '';
    this.password = process.env.REDDIT_PASSWORD || '';
  }

  /**
   * Get access token for Reddit API
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Request new token
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        `grant_type=password&username=${this.username}&password=${this.password}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent
          },
          auth: {
            username: this.clientId,
            password: this.clientSecret
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Reddit authentication error:', error);
      throw new Error('Failed to authenticate with Reddit API');
    }
  }

  /**
   * Search Reddit for product discussions
   */
  async searchProducts(query: string, limit: number = 25): Promise<any[]> {
    // Check cache first
    const cacheKey = `${REDDIT_CACHE_PREFIX}${query}:${limit}`;
    const cachedResults = await redisClient.get(cacheKey);
    
    if (cachedResults) {
      console.log('Returning cached Reddit results for:', query);
      return JSON.parse(cachedResults);
    }

    try {
      // Get access token
      const token = await this.getAccessToken();

      // Search subreddits related to product reviews
      const subreddits = [
        'ProductReviews',
        'BuyItForLife',
        'gadgets',
        'tech',
        'reviews',
        'GoodValue'
      ];

      // Build search query
      const searchQuery = encodeURIComponent(`${query} self:yes`);
      
      // Make requests to each subreddit
      const requests = subreddits.map(subreddit => 
        axios.get(
          `https://oauth.reddit.com/r/${subreddit}/search?q=${searchQuery}&sort=relevance&limit=${Math.ceil(limit / subreddits.length)}&t=year`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': this.userAgent
            }
          }
        )
      );

      // Execute all requests in parallel
      const responses = await Promise.all(requests);
      
      // Process and combine results
      const results = [];
      
      for (const response of responses) {
        const posts = response.data.data.children;
        
        for (const post of posts) {
          const data = post.data;
          
          // Extract product name from title
          const productName = this.extractProductName(data.title, query);
          
          if (productName) {
            results.push({
              source: 'reddit',
              source_id: data.id,
              product_name: productName,
              content: data.selftext || data.title,
              url: `https://reddit.com${data.permalink}`,
              created_at: new Date(data.created_utc * 1000)
            });
          }
        }
      }
      
      // Cache results
      await redisClient.set(cacheKey, JSON.stringify(results), {
        EX: REDDIT_CACHE_TTL
      });
      
      return results;
    } catch (error) {
      console.error('Reddit search error:', error);
      return [];
    }
  }

  /**
   * Extract product name from title
   */
  private extractProductName(title: string, query: string): string | null {
    // Simple extraction logic - can be improved with NLP
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (titleLower.includes(queryLower)) {
      // Look for patterns like "Product Name Review" or "Review of Product Name"
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
          // Extract after "review of" or similar
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
export const redditService = new RedditService();
