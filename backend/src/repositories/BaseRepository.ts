import { pool } from '../config/db';

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected tableName: string;
  protected idColumn: string;

  constructor(tableName: string, idColumn: string = 'id') {
    this.tableName = tableName;
    this.idColumn = idColumn;
  }

  /**
   * Find all records
   */
  async findAll(): Promise<T[]> {
    const result = await pool.query(`SELECT * FROM ${this.tableName}`);
    return result.rows;
  }

  /**
   * Find record by ID
   */
  async findById(id: number): Promise<T | null> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = $1`,
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find records by a specific column value
   */
  async findByColumn(column: string, value: any): Promise<T[]> {
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE ${column} = $1`,
      [value]
    );
    
    return result.rows;
  }

  /**
   * Create a new record
   */
  abstract create(data: CreateDTO): Promise<T>;

  /**
   * Update a record
   */
  abstract update(id: number, data: UpdateDTO): Promise<T | null>;

  /**
   * Delete a record
   */
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = $1 RETURNING *`,
      [id]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Count records
   */
  async count(): Promise<number> {
    const result = await pool.query(`SELECT COUNT(*) FROM ${this.tableName}`);
    return parseInt(result.rows[0].count);
  }

  /**
   * Find records with pagination
   */
  async findWithPagination(page: number = 1, limit: number = 10): Promise<T[]> {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }
}
