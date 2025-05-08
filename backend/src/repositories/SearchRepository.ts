import { pool } from '../config/db';
import { UserSearch, UserFavorite } from '../models/Search';

export class SearchRepository {
  /**
   * Log a user search
   */
  async logSearch(userId: number, query: string, resultsCount: number): Promise<UserSearch> {
    const result = await pool.query(
      `INSERT INTO user_searches (user_id, query, results_count)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, query, resultsCount]
    );
    
    return result.rows[0];
  }

  /**
   * Get recent searches for a user
   */
  async getRecentSearches(userId: number, limit: number = 10): Promise<UserSearch[]> {
    const result = await pool.query(
      `SELECT * FROM user_searches
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }

  /**
   * Get popular searches across all users
   */
  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const result = await pool.query(
      `SELECT query, COUNT(*) as count
       FROM user_searches
       GROUP BY query
       ORDER BY count DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }

  /**
   * Add a product to user favorites
   */
  async addFavorite(userId: number, productId: number): Promise<UserFavorite> {
    const result = await pool.query(
      `INSERT INTO user_favorites (user_id, product_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, productId]
    );
    
    return result.rows[0];
  }

  /**
   * Remove a product from user favorites
   */
  async removeFavorite(userId: number, productId: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM user_favorites
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Get user favorites
   */
  async getUserFavorites(userId: number): Promise<UserFavorite[]> {
    const result = await pool.query(
      `SELECT uf.*, p.name as product_name, p.image_url
       FROM user_favorites uf
       JOIN products p ON uf.product_id = p.id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Check if a product is in user favorites
   */
  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM user_favorites
       WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    
    return result.rows.length > 0;
  }
}
