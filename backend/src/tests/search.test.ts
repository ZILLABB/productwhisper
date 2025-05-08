import request from 'supertest';
import { app } from '../app';
import { productRepository, searchRepository, userRepository } from '../repositories';
import { generateAccessToken } from '../config/jwt';

// Mock the repositories
jest.mock('../repositories', () => ({
  productRepository: {
    searchProducts: jest.fn()
  },
  searchRepository: {
    logSearch: jest.fn(),
    getRecentSearches: jest.fn(),
    getPopularSearches: jest.fn(),
    getUserFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    isFavorite: jest.fn()
  },
  userRepository: {
    findById: jest.fn()
  }
}));

describe('Search Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/search', () => {
    it('should search for products', async () => {
      // Mock repository responses
      (productRepository.searchProducts as jest.Mock).mockResolvedValue([
        {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          category: 'Test Category',
          image_url: 'https://example.com/image.jpg',
          brand: 'Test Brand',
          price: 99.99,
          average_rating: 4.5,
          scores: {
            overall: 0.8,
            reddit: 0.7,
            amazon: 0.9,
            youtube: 0.6,
            confidence: 0.75,
            sample_size: 10
          },
          sources: ['reddit', 'amazon'],
          tags: ['electronics', 'gadget']
        }
      ]);

      const response = await request(app)
        .post('/api/search')
        .send({
          query: 'test product',
          filters: {
            minScore: 0.5,
            sortBy: 'score'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('query', 'test product');
      expect(response.body).toHaveProperty('results_count', 1);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0]).toHaveProperty('name', 'Test Product');
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({
          filters: {
            minScore: 0.5
          }
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/search/recent', () => {
    it('should get recent searches for authenticated user', async () => {
      // Mock repository responses
      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        is_active: true
      });
      (searchRepository.getRecentSearches as jest.Mock).mockResolvedValue([
        {
          id: 1,
          user_id: 1,
          query: 'test product',
          created_at: new Date(),
          results_count: 5
        },
        {
          id: 2,
          user_id: 1,
          query: 'another product',
          created_at: new Date(),
          results_count: 3
        }
      ]);

      // Generate a token for testing
      const token = generateAccessToken(1);

      const response = await request(app)
        .get('/api/search/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('searches');
      expect(response.body.searches).toHaveLength(2);
      expect(response.body.searches[0]).toHaveProperty('query', 'test product');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/search/recent');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/search/favorites', () => {
    it('should get favorites for authenticated user', async () => {
      // Mock repository responses
      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: 1,
        is_active: true
      });
      (searchRepository.getUserFavorites as jest.Mock).mockResolvedValue([
        {
          id: 1,
          user_id: 1,
          product_id: 1,
          created_at: new Date(),
          product_name: 'Test Product',
          image_url: 'https://example.com/image.jpg'
        }
      ]);

      // Generate a token for testing
      const token = generateAccessToken(1);

      const response = await request(app)
        .get('/api/search/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('favorites');
      expect(response.body.favorites).toHaveLength(1);
      expect(response.body.favorites[0]).toHaveProperty('product_name', 'Test Product');
    });
  });
});
