import { pool } from '../config/db';
import { BaseRepository } from './BaseRepository';
import { User, CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../models/User';
import bcrypt from 'bcrypt';

export class UserRepository extends BaseRepository<User, CreateUserDTO, UpdateUserDTO> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserDTO): Promise<User> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [data.username, data.email, hashedPassword]
    );
    
    return result.rows[0];
  }

  /**
   * Update a user
   */
  async update(id: number, data: UpdateUserDTO): Promise<User | null> {
    // Start building the query
    let query = 'UPDATE users SET ';
    const values: any[] = [];
    const setClauses: string[] = [];
    let paramIndex = 1;
    
    // Add username if provided
    if (data.username !== undefined) {
      setClauses.push(`username = $${paramIndex++}`);
      values.push(data.username);
    }
    
    // Add email if provided
    if (data.email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    
    // Add password if provided
    if (data.password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      setClauses.push(`password_hash = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    
    // Add preferences if provided
    if (data.preferences !== undefined) {
      setClauses.push(`preferences = $${paramIndex++}`);
      values.push(data.preferences);
    }
    
    // Add is_active if provided
    if (data.is_active !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }
    
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
   * Update last login timestamp
   */
  async updateLastLogin(id: number): Promise<boolean> {
    const result = await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Get user with roles
   */
  async getUserWithRoles(id: number): Promise<UserResponseDTO | null> {
    const result = await pool.query(
      `SELECT u.*, ARRAY_AGG(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    // Remove password hash for security
    const { password_hash, ...userResponse } = user;
    
    // Filter out null values from roles array (if user has no roles)
    userResponse.roles = userResponse.roles.filter((role: string | null) => role !== null);
    
    return userResponse as UserResponseDTO;
  }

  /**
   * Add role to user
   */
  async addRole(userId: number, roleId: number): Promise<boolean> {
    try {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId]
      );
      
      return true;
    } catch (error) {
      console.error('Error adding role to user:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    return result.rowCount > 0;
  }
}
