import { pool } from '../config/db';
import logger from './loggerService';
import { trackDbQuery } from './monitoringService';

/**
 * Query Optimizer Service
 * Provides optimized database query functions with monitoring and caching
 */
export class QueryOptimizer {
  /**
   * Execute a database query with performance tracking
   * @param query - SQL query string
   * @param params - Query parameters
   * @param operation - Operation type for monitoring
   * @returns Query result
   */
  async executeQuery(query: string, params: any[] = [], operation: string = 'query'): Promise<any> {
    const startTime = Date.now();
    let success = false;
    
    try {
      // Execute query
      const result = await pool.query(query, params);
      success = true;
      return result;
    } catch (error) {
      logger.error(`Database query error (${operation}):`, error);
      throw error;
    } finally {
      // Track query performance
      const duration = Date.now() - startTime;
      trackDbQuery(operation, success, duration);
      
      // Log slow queries
      if (duration > 100) {
        logger.warn(`Slow database query (${operation}): ${duration}ms - ${query.substring(0, 100)}...`);
      }
    }
  }

  /**
   * Execute a SELECT query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async select(query: string, params: any[] = []): Promise<any> {
    return this.executeQuery(query, params, 'select');
  }

  /**
   * Execute an INSERT query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async insert(query: string, params: any[] = []): Promise<any> {
    return this.executeQuery(query, params, 'insert');
  }

  /**
   * Execute an UPDATE query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async update(query: string, params: any[] = []): Promise<any> {
    return this.executeQuery(query, params, 'update');
  }

  /**
   * Execute a DELETE query
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Query result
   */
  async delete(query: string, params: any[] = []): Promise<any> {
    return this.executeQuery(query, params, 'delete');
  }

  /**
   * Execute a query in a transaction
   * @param callback - Function that executes queries in the transaction
   * @returns Result of the transaction
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    const startTime = Date.now();
    let success = false;
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      success = true;
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
      
      // Track transaction performance
      const duration = Date.now() - startTime;
      trackDbQuery('transaction', success, duration);
      
      // Log slow transactions
      if (duration > 500) {
        logger.warn(`Slow transaction: ${duration}ms`);
      }
    }
  }

  /**
   * Execute a batch of queries in a transaction
   * @param queries - Array of query objects with query string and parameters
   * @returns Results of all queries
   */
  async batchQueries(queries: { query: string; params: any[]; operation?: string }[]): Promise<any[]> {
    return this.transaction(async (client) => {
      const results = [];
      
      for (const { query, params, operation = 'query' } of queries) {
        const startTime = Date.now();
        let success = false;
        
        try {
          const result = await client.query(query, params);
          success = true;
          results.push(result);
        } catch (error) {
          logger.error(`Batch query error (${operation}):`, error);
          throw error;
        } finally {
          // Track query performance
          const duration = Date.now() - startTime;
          trackDbQuery(operation, success, duration);
        }
      }
      
      return results;
    });
  }

  /**
   * Execute a paginated query
   * @param baseQuery - Base SQL query without LIMIT and OFFSET
   * @param params - Query parameters
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Paginated results with metadata
   */
  async paginate(baseQuery: string, params: any[] = [], page: number = 1, limit: number = 10): Promise<any> {
    // Validate page and limit
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Add pagination to query
    const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const paginatedParams = [...params, limit, offset];
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS count_query`;
    
    // Execute both queries in parallel
    const [results, countResult] = await Promise.all([
      this.select(paginatedQuery, paginatedParams),
      this.select(countQuery, params)
    ]);
    
    // Calculate pagination metadata
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: results.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer();
