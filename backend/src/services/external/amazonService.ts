import axios from 'axios';
import crypto from 'crypto';
import { redisClient } from '../../config/redis';

// Cache keys
const AMAZON_CACHE_PREFIX = 'amazon:search:';
const AMAZON_CACHE_TTL = 86400; // 24 hours

/**
 * Amazon Product API Service
 * Uses Amazon Product Advertising API
 */
export class AmazonService {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private region: string;
  private host: string;

  constructor() {
    // Load credentials from environment variables
    this.accessKey = process.env.AMAZON_ACCESS_KEY || '';
    this.secretKey = process.env.AMAZON_SECRET_KEY || '';
    this.partnerTag = process.env.AMAZON_PARTNER_TAG || '';
    this.region = process.env.AMAZON_REGION || 'us-east-1';
    this.host = `webservices.amazon.${this.region === 'us-east-1' ? 'com' : this.region}`;
  }

  /**
   * Generate signature for Amazon API request
   */
  private generateSignature(stringToSign: string): string {
    return crypto.createHmac('sha256', this.secretKey)
      .update(stringToSign)
      .digest('base64');
  }

  /**
   * Search Amazon for products
   */
  async searchProducts(query: string, limit: number = 10): Promise<any[]> {
    // Check cache first
    const cacheKey = `${AMAZON_CACHE_PREFIX}${query}:${limit}`;
    const cachedResults = await redisClient.get(cacheKey);
    
    if (cachedResults) {
      console.log('Returning cached Amazon results for:', query);
      return JSON.parse(cachedResults);
    }

    try {
      // Check if credentials are configured
      if (!this.accessKey || !this.secretKey || !this.partnerTag) {
        console.warn('Amazon API credentials not configured');
        return [];
      }

      // Current timestamp
      const timestamp = new Date().toISOString().replace(/\\..+/, 'Z');
      
      // Request parameters
      const params = {
        'Service': 'ProductAdvertisingAPI',
        'Operation': 'SearchItems',
        'PartnerTag': this.partnerTag,
        'PartnerType': 'Associates',
        'Marketplace': 'www.amazon.com',
        'Keywords': query,
        'SearchIndex': 'All',
        'ItemCount': limit,
        'Resources': [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'ItemInfo.ByLineInfo',
          'Images.Primary.Large',
          'Offers.Listings.Price',
          'CustomerReviews.Count',
          'CustomerReviews.StarRating'
        ].join(','),
        'AWSAccessKeyId': this.accessKey,
        'Timestamp': timestamp
      };
      
      // Create canonical request
      const canonicalQuery = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key as keyof typeof params])}`)
        .join('&');
      
      const path = '/paapi5/searchitems';
      const canonicalRequest = `GET\n${this.host}\n${path}\n${canonicalQuery}`;
      
      // Generate signature
      const signature = this.generateSignature(canonicalRequest);
      
      // Add signature to query
      const signedQuery = `${canonicalQuery}&Signature=${encodeURIComponent(signature)}`;
      
      // Make request
      const response = await axios.get(`https://${this.host}${path}?${signedQuery}`);
      
      // Process results
      const results = [];
      
      if (response.data.SearchResult && response.data.SearchResult.Items) {
        for (const item of response.data.SearchResult.Items) {
          // Extract product details
          const product = {
            source: 'amazon',
            source_id: item.ASIN,
            product_name: item.ItemInfo.Title.DisplayValue,
            description: item.ItemInfo.Features ? item.ItemInfo.Features.DisplayValues.join(' ') : null,
            image_url: item.Images.Primary.Large.URL,
            price: item.Offers?.Listings[0]?.Price?.Amount || null,
            brand: item.ItemInfo.ByLineInfo?.Brand?.DisplayValue || null,
            external_ids: { asin: item.ASIN },
            reviews: [],
            url: `https://www.amazon.com/dp/${item.ASIN}?tag=${this.partnerTag}`,
            created_at: new Date()
          };
          
          // Get reviews if available
          if (item.CustomerReviews && item.CustomerReviews.Count > 0) {
            try {
              const reviewsResponse = await this.getProductReviews(item.ASIN);
              product.reviews = reviewsResponse;
            } catch (reviewError) {
              console.error('Error fetching Amazon reviews:', reviewError);
            }
          }
          
          results.push(product);
        }
      }
      
      // Cache results
      await redisClient.set(cacheKey, JSON.stringify(results), {
        EX: AMAZON_CACHE_TTL
      });
      
      return results;
    } catch (error) {
      console.error('Amazon search error:', error);
      return [];
    }
  }

  /**
   * Get reviews for a product
   * Note: Amazon doesn't provide an official API for reviews, so this is a simplified implementation
   */
  private async getProductReviews(asin: string): Promise<any[]> {
    // In a real implementation, you would use a scraper or a third-party service
    // This is a simplified mock implementation
    return [
      {
        content: `This product is amazing! Great quality and value.`,
        rating: 5,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        content: `Decent product but a bit expensive for what you get.`,
        rating: 3,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      }
    ];
  }
}

// Export singleton instance
export const amazonService = new AmazonService();
