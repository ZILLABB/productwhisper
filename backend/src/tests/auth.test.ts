import request from 'supertest';
import { app } from '../app';
import { userRepository } from '../repositories';
import { generateAccessToken } from '../config/jwt';

// Mock the user repository
jest.mock('../repositories', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
    getUserWithRoles: jest.fn(),
    findById: jest.fn()
  }
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock repository responses
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date(),
        last_login: null,
        preferences: null,
        is_active: true
      });
      (userRepository.getUserWithRoles as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
        last_login: null,
        preferences: null,
        is_active: true,
        roles: ['user']
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('access');
      expect(response.body.tokens).toHaveProperty('refresh');
    });

    it('should return 400 if user already exists', async () => {
      // Mock repository responses
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User with that email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      // Mock bcrypt.compare
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true)
      }));

      // Mock repository responses
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date(),
        last_login: null,
        preferences: null,
        is_active: true
      });
      (userRepository.updateLastLogin as jest.Mock).mockResolvedValue(true);
      (userRepository.getUserWithRoles as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
        last_login: new Date(),
        preferences: null,
        is_active: true,
        roles: ['user']
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('access');
      expect(response.body.tokens).toHaveProperty('refresh');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      // Mock repository responses
      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date(),
        last_login: new Date(),
        preferences: null,
        is_active: true
      });
      (userRepository.getUserWithRoles as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
        last_login: new Date(),
        preferences: null,
        is_active: true,
        roles: ['user']
      });

      // Generate a token for testing
      const token = generateAccessToken(1);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token is required');
    });
  });
});
