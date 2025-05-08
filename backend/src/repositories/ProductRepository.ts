import { pool } from '../config/db';
import { BaseRepository } from './BaseRepository';
import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductDetailDTO,
  ProductMention,
  ProductScore
} from '../models/Product';
import { queryOptimizer } from '../services/queryOptimizer';
import { cacheService, CacheTTL, CachePrefix } from '../services/cacheService';

export class ProductRepository extends BaseRepository<Product, CreateProductDTO, UpdateProductDTO> {
  constructor() {
    super('products');
  }

  /**
   * Create a new product
   */
  async create(data: CreateProductDTO): Promise<Product> {
    const columns = ['name'];
    const values = [data.name];
    const placeholders = ['$1'];
    let paramIndex = 2;

    // Add optional fields if provided
    if (data.description !== undefined) {
      columns.push('description');
      values.push(data.description);
      placeholders.push(`$${paramIndex++}`);
    }

    if (data.category !== undefined) {
      columns.push('category');
      values.push(data.category);
      placeholders.push(`$${paramIndex++}`);
    }

    if (data.image_url !== undefined) {
      columns.push('image_url');
      values.push(data.image_url);
      placeholders.push(`$${paramIndex++}`);
    }

    if (data.external_ids !== undefined) {
      columns.push('external_ids');
      values.push(data.external_ids);
      placeholders.push(`$${paramIndex++}`);
    }

    if (data.price !== undefined) {
      columns.push('price');
      values.push(data.price);
      placeholders.push(`$${paramIndex++}`);
    }

    if (data.brand !== undefined) {
      columns.push('brand');
      values.push(data.brand);
      placeholders.push(`$${paramIndex++}`);
    }

    const query = `
      INSERT INTO products (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Update a product
   */
  async update(id: number, data: UpdateProductDTO): Promise<Product | null> {
    // Start building the query
    let query = 'UPDATE products SET ';
    const values: any[] = [];
    const setClauses: string[] = [];
    let paramIndex = 1;

    // Add fields if provided
    if (data.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }

    if (data.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }

    if (data.image_url !== undefined) {
      setClauses.push(`image_url = $${paramIndex++}`);
      values.push(data.image_url);
    }

    if (data.external_ids !== undefined) {
      setClauses.push(`external_ids = $${paramIndex++}`);
      values.push(data.external_ids);
    }

    if (data.price !== undefined) {
      setClauses.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }

    if (data.brand !== undefined) {
      setClauses.push(`brand = $${paramIndex++}`);
      values.push(data.brand);
    }

    if (data.average_rating !== undefined) {
      setClauses.push(`average_rating = $${paramIndex++}`);
      values.push(data.average_rating);
    }

    // Always update the updated_at timestamp
    setClauses.push(`updated_at = NOW()`);

    // If no fields to update, return null
    if (setClauses.length === 0) {
      return null;
    }

    // Complete the query
    query += setClauses.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Get product with scores, mentions, and tags
   */
  async getProductDetail(id: number): Promise<ProductDetailDTO | null> {
    // Get the product
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return null;
    }

    const product = productResult.rows[0] as Product;

    // Get the product scores
    const scoresResult = await pool.query(
      'SELECT * FROM product_scores WHERE product_id = $1',
      [id]
    );

    const scores = scoresResult.rows.length > 0
      ? scoresResult.rows[0] as ProductScore
      : null;

    // Get the product mentions
    const mentionsResult = await pool.query(
      'SELECT * FROM product_mentions WHERE product_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const mentions = mentionsResult.rows as ProductMention[];

    // Get the product tags
    const tagsResult = await pool.query(
      `SELECT t.name
       FROM tags t
       JOIN product_tags pt ON t.id = pt.tag_id
       WHERE pt.product_id = $1`,
      [id]
    );

    const tags = tagsResult.rows.map(row => row.name);

    return {
      ...product,
      scores,
      mentions,
      tags
    };
  }

  /**
   * Search products with filters
   */
  async searchProducts(
    query: string,
    filters: {
      minScore?: number;
      sources?: string[];
      minConfidence?: number;
      sortBy?: 'score' | 'confidence' | 'mentions';
      category?: string;
      brand?: string;
      tags?: string[];
      priceMin?: number;
      priceMax?: number;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ data: ProductDetailDTO[]; pagination?: any }> {
    // Generate cache key
    const cacheKey = `${CachePrefix.SEARCH}products:${query}:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cachedResults = await cacheService.get(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Build the base query
    let sqlQuery = `
      SELECT
        p.*,
        ps.overall_score, ps.reddit_score, ps.amazon_score, ps.youtube_score,
        ps.confidence_score, ps.sample_size,
        ARRAY_AGG(DISTINCT t.name) as tags,
        ARRAY_AGG(DISTINCT pm.source) as sources
      FROM
        products p
      LEFT JOIN
        product_scores ps ON p.id = ps.product_id
      LEFT JOIN
        product_mentions pm ON p.id = pm.product_id
      LEFT JOIN
        product_tags pt ON p.id = pt.product_id
      LEFT JOIN
        tags t ON pt.tag_id = t.id
      WHERE
        (p.name ILIKE $1 OR p.description ILIKE $1)
    `;

    const values: any[] = [`%${query}%`];
    let paramIndex = 2;

    // Add filters
    if (filters.minScore !== undefined) {
      sqlQuery += ` AND ps.overall_score >= $${paramIndex++}`;
      values.push(filters.minScore);
    }

    if (filters.minConfidence !== undefined) {
      sqlQuery += ` AND ps.confidence_score >= $${paramIndex++}`;
      values.push(filters.minConfidence);
    }

    if (filters.category !== undefined) {
      sqlQuery += ` AND p.category = $${paramIndex++}`;
      values.push(filters.category);
    }

    if (filters.brand !== undefined) {
      sqlQuery += ` AND p.brand = $${paramIndex++}`;
      values.push(filters.brand);
    }

    if (filters.priceMin !== undefined) {
      sqlQuery += ` AND p.price >= $${paramIndex++}`;
      values.push(filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      sqlQuery += ` AND p.price <= $${paramIndex++}`;
      values.push(filters.priceMax);
    }

    if (filters.tags && filters.tags.length > 0) {
      sqlQuery += ` AND t.name = ANY($${paramIndex++})`;
      values.push(filters.tags);
    }

    if (filters.sources && filters.sources.length > 0) {
      sqlQuery += ` AND pm.source = ANY($${paramIndex++})`;
      values.push(filters.sources);
    }

    // Group by product id
    sqlQuery += ` GROUP BY p.id, ps.id`;

    // Add sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'score':
          sqlQuery += ` ORDER BY ps.overall_score DESC NULLS LAST`;
          break;
        case 'confidence':
          sqlQuery += ` ORDER BY ps.confidence_score DESC NULLS LAST`;
          break;
        case 'mentions':
          sqlQuery += ` ORDER BY ps.sample_size DESC NULLS LAST`;
          break;
        default:
          sqlQuery += ` ORDER BY ps.overall_score DESC NULLS LAST`;
      }
    } else {
      sqlQuery += ` ORDER BY ps.overall_score DESC NULLS LAST`;
    }

    // Check if pagination is requested
    if (filters.page !== undefined || filters.limit !== undefined) {
      const page = filters.page || 1;
      const limit = filters.limit || 10;

      // Use the query optimizer's paginate method
      const paginatedResults = await queryOptimizer.paginate(sqlQuery, values, page, limit);

      // Transform the results
      const transformedData = paginatedResults.data.map(this.transformProductResult);

      // Create result object with pagination
      const result = {
        data: transformedData,
        pagination: paginatedResults.pagination
      };

      // Cache the results
      await cacheService.set(cacheKey, result, CacheTTL.MEDIUM);

      return result;
    } else {
      // Execute the query without pagination
      const result = await queryOptimizer.select(sqlQuery, values);

      // Transform the results
      const transformedData = result.rows.map(this.transformProductResult);

      // Create result object
      const resultObject = { data: transformedData };

      // Cache the results
      await cacheService.set(cacheKey, resultObject, CacheTTL.MEDIUM);

      return resultObject;
    }
  }

  /**
   * Transform product query result to ProductDetailDTO
   * @private
   */
  private transformProductResult(row: any): ProductDetailDTO {
    const {
      overall_score, reddit_score, amazon_score, youtube_score,
      confidence_score, sample_size, tags, sources,
      ...product
    } = row;

    return {
      ...product,
      scores: {
        overall: overall_score,
        reddit: reddit_score,
        amazon: amazon_score,
        youtube: youtube_score,
        confidence: confidence_score,
        sample_size: sample_size
      },
      tags: tags.filter((tag: string | null) => tag !== null),
      sources: sources.filter((source: string | null) => source !== null),
      mentions: [] // We don't load all mentions in search results for performance
    };
  }

  /**
   * Add a tag to a product
   */
  async addTag(productId: number, tagId: number): Promise<boolean> {
    try {
      await pool.query(
        'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)',
        [productId, tagId]
      );

      return true;
    } catch (error) {
      console.error('Error adding tag to product:', error);
      return false;
    }
  }

  /**
   * Remove a tag from a product
   */
  async removeTag(productId: number, tagId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM product_tags WHERE product_id = $1 AND tag_id = $2',
      [productId, tagId]
    );

    return result.rowCount > 0;
  }

  /**
   * Add a mention to a product
   */
  async addMention(mention: Omit<ProductMention, 'id' | 'processed_at'>): Promise<ProductMention> {
    const result = await pool.query(
      `INSERT INTO product_mentions
       (product_id, source, source_id, content, sentiment_score, url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        mention.product_id,
        mention.source,
        mention.source_id,
        mention.content,
        mention.sentiment_score,
        mention.url,
        mention.created_at || new Date()
      ]
    );

    return result.rows[0];
  }

  /**
   * Update product scores
   */
  async updateScores(
    productId: number,
    scores: {
      overall_score?: number;
      reddit_score?: number;
      amazon_score?: number;
      youtube_score?: number;
      confidence_score?: number;
      sample_size?: number;
    }
  ): Promise<ProductScore | null> {
    // Check if scores exist for this product
    const checkResult = await pool.query(
      'SELECT id FROM product_scores WHERE product_id = $1',
      [productId]
    );

    if (checkResult.rows.length === 0) {
      // Create new scores
      const insertResult = await pool.query(
        `INSERT INTO product_scores
         (product_id, overall_score, reddit_score, amazon_score, youtube_score, confidence_score, sample_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          productId,
          scores.overall_score || null,
          scores.reddit_score || null,
          scores.amazon_score || null,
          scores.youtube_score || null,
          scores.confidence_score || null,
          scores.sample_size || null
        ]
      );

      return insertResult.rows[0];
    } else {
      // Update existing scores
      let query = 'UPDATE product_scores SET ';
      const values: any[] = [];
      const setClauses: string[] = [];
      let paramIndex = 1;

      // Add fields if provided
      if (scores.overall_score !== undefined) {
        setClauses.push(`overall_score = $${paramIndex++}`);
        values.push(scores.overall_score);
      }

      if (scores.reddit_score !== undefined) {
        setClauses.push(`reddit_score = $${paramIndex++}`);
        values.push(scores.reddit_score);
      }

      if (scores.amazon_score !== undefined) {
        setClauses.push(`amazon_score = $${paramIndex++}`);
        values.push(scores.amazon_score);
      }

      if (scores.youtube_score !== undefined) {
        setClauses.push(`youtube_score = $${paramIndex++}`);
        values.push(scores.youtube_score);
      }

      if (scores.confidence_score !== undefined) {
        setClauses.push(`confidence_score = $${paramIndex++}`);
        values.push(scores.confidence_score);
      }

      if (scores.sample_size !== undefined) {
        setClauses.push(`sample_size = $${paramIndex++}`);
        values.push(scores.sample_size);
      }

      // Always update the last_updated timestamp
      setClauses.push(`last_updated = NOW()`);

      // Complete the query
      query += setClauses.join(', ');
      query += ` WHERE product_id = $${paramIndex} RETURNING *`;
      values.push(productId);

      const result = await pool.query(query, values);

      return result.rows.length > 0 ? result.rows[0] : null;
    }
  }
}
