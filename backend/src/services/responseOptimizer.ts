import { Request, Response } from 'express';
import { cacheService, CacheTTL, CachePrefix } from './cacheService';
import logger from './loggerService';
import zlib from 'zlib';

/**
 * Response Optimizer Service
 * Provides optimized API response functions with caching and compression
 */
export class ResponseOptimizer {
  /**
   * Send a successful response
   * @param res - Express response object
   * @param data - Response data
   * @param status - HTTP status code
   */
  sendSuccess(res: Response, data: any, status: number = 200): void {
    res.status(status).json({
      success: true,
      data
    });
  }

  /**
   * Send an error response
   * @param res - Express response object
   * @param message - Error message
   * @param status - HTTP status code
   * @param errors - Additional error details
   */
  sendError(res: Response, message: string, status: number = 500, errors?: any): void {
    res.status(status).json({
      success: false,
      error: {
        message,
        status,
        timestamp: new Date().toISOString(),
        ...(errors && { details: errors })
      }
    });
  }

  /**
   * Send a cached response or generate and cache a new one
   * @param req - Express request object
   * @param res - Express response object
   * @param cacheKey - Cache key
   * @param dataFn - Function to generate data if not in cache
   * @param ttl - Cache TTL in seconds
   */
  async sendCached(
    req: Request,
    res: Response,
    cacheKey: string,
    dataFn: () => Promise<any>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<void> {
    try {
      // Get data from cache or generate it
      const data = await cacheService.getOrSet(cacheKey, dataFn, ttl);
      
      // Send response
      this.sendSuccess(res, data);
    } catch (error) {
      logger.error('Error in sendCached:', error);
      this.sendError(res, 'An error occurred while processing your request');
    }
  }

  /**
   * Send a paginated response
   * @param res - Express response object
   * @param data - Paginated data
   * @param pagination - Pagination metadata
   */
  sendPaginated(res: Response, data: any[], pagination: any): void {
    this.sendSuccess(res, {
      data,
      pagination
    });
  }

  /**
   * Send a compressed response
   * @param req - Express request object
   * @param res - Express response object
   * @param data - Response data
   */
  sendCompressed(req: Request, res: Response, data: any): void {
    // Check if client accepts gzip encoding
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (acceptEncoding.includes('gzip')) {
      // Compress data
      zlib.gzip(JSON.stringify(data), (err, compressed) => {
        if (err) {
          logger.error('Compression error:', err);
          this.sendSuccess(res, data);
          return;
        }
        
        // Send compressed response
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Type', 'application/json');
        res.send(compressed);
      });
    } else {
      // Send uncompressed response
      this.sendSuccess(res, data);
    }
  }

  /**
   * Send a streamed response for large data sets
   * @param req - Express request object
   * @param res - Express response object
   * @param dataStream - Data stream or async generator
   */
  async sendStream(req: Request, res: Response, dataStream: AsyncIterable<any>): Promise<void> {
    try {
      // Set headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      // Start the response
      res.write('{"success":true,"data":[');
      
      let first = true;
      
      // Stream data
      for await (const item of dataStream) {
        if (!first) {
          res.write(',');
        } else {
          first = false;
        }
        
        res.write(JSON.stringify(item));
      }
      
      // End the response
      res.write(']}');
      res.end();
    } catch (error) {
      logger.error('Stream error:', error);
      
      // If headers haven't been sent yet, send error response
      if (!res.headersSent) {
        this.sendError(res, 'An error occurred while streaming data');
      } else {
        // Otherwise, end the response
        res.end();
      }
    }
  }

  /**
   * Create a cache key for a request
   * @param req - Express request object
   * @param prefix - Cache key prefix
   * @returns Cache key
   */
  createCacheKey(req: Request, prefix: string = CachePrefix.SEARCH): string {
    const { originalUrl, method, query, body } = req;
    const userId = req.user ? req.user.id : 'anonymous';
    
    // Create a unique key based on request properties
    return `${prefix}${method}:${originalUrl}:${userId}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
  }
}

// Export singleton instance
export const responseOptimizer = new ResponseOptimizer();
