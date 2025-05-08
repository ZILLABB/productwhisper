import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError } from './apiError';
import type {
  Product,
  SearchFilters,
  SearchResult,
  TrendData,
  User,
  AuthTokens,
  Notification
} from '../types/api';
import { getMockProduct, getMockSearchResults, getMockTrendingProducts, getMockTrendData } from '../utils/mockData';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Development mode flag
const IS_DEV = import.meta.env.DEV;

// Token storage keys
const ACCESS_TOKEN_KEY = 'pw_access_token';
const REFRESH_TOKEN_KEY = 'pw_refresh_token';

/**
 * API Service for ProductWhisper
 */
class ApiService {
  private api: AxiosInstance;
  private refreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Create axios instance
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh and error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If error is 401 and not a refresh token request
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('auth/refresh')
        ) {
          if (this.refreshing) {
            // Wait for the refresh to complete
            try {
              const newToken = await this.refreshPromise;
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              }
              return this.api(originalRequest);
            } catch (refreshError) {
              this.logout();
              return Promise.reject(ApiError.fromAxiosError(error));
            }
          }

          originalRequest._retry = true;
          this.refreshing = true;

          // Try to refresh the token
          this.refreshPromise = this.refreshToken();

          try {
            const newToken = await this.refreshPromise;
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(ApiError.fromAxiosError(error));
          } finally {
            this.refreshing = false;
            this.refreshPromise = null;
          }
        }

        // Convert Axios error to ApiError
        return Promise.reject(ApiError.fromAxiosError(error));
      }
    );
  }

  /**
   * Get access token from storage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set tokens in storage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear tokens from storage
   */
  private clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new ApiError('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });

      const { access, refresh } = response.data.tokens;
      this.setTokens(access, refresh);

      return access;
    } catch (error) {
      this.clearTokens();
      if (error instanceof AxiosError) {
        throw ApiError.fromAxiosError(error);
      }
      throw error;
    }
  }

  /**
   * Handle API request with error handling and mock data fallback
   */
  private async handleRequest<T>(
    requestFn: () => Promise<AxiosResponse<any>>,
    mockData?: T,
    errorMessage: string = 'Failed to fetch data'
  ): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      // In development mode, if mock data is provided, return it
      if (IS_DEV && mockData !== undefined) {
        console.warn('Using mock data due to API error:', error);
        return mockData;
      }

      // Otherwise, throw the error
      if (error instanceof AxiosError) {
        throw ApiError.fromAxiosError(error);
      } else if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(errorMessage, undefined, null, null, error as Error);
      }
    }
  }

  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<User> {
    try {
      const response = await this.api.post('/auth/register', {
        username,
        email,
        password,
      });

      const { tokens, user } = response.data;
      this.setTokens(tokens.access, tokens.refresh);

      return user;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw ApiError.fromAxiosError(error);
      }
      throw new ApiError('Registration failed. Please try again.', undefined, null, null, error as Error);
    }
  }

  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });

      const { tokens, user } = response.data;
      this.setTokens(tokens.access, tokens.refresh);

      return user;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw ApiError.fromAxiosError(error);
      }
      throw new ApiError('Login failed. Please check your credentials and try again.', undefined, null, null, error as Error);
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    try {
      // Attempt to call logout endpoint if available
      this.api.post('/auth/logout').catch(() => {
        // Silently fail if the endpoint doesn't exist
      });
    } finally {
      // Always clear tokens
      this.clearTokens();
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    // Mock data for development fallback
    const mockUser: User = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      bio: "Audio enthusiast and tech reviewer",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    return this.handleRequest<User>(
      () => this.api.get('/auth/me'),
      mockUser,
      'Failed to fetch user information'
    );
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.handleRequest<User>(
      () => this.api.put('/auth/profile', profileData),
      { ...profileData, id: 1, createdAt: new Date().toISOString() } as User,
      'Failed to update profile'
    );
  }

  /**
   * Update user password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return this.handleRequest<{ success: boolean }>(
      () => this.api.put('/auth/password', { currentPassword, newPassword }),
      { success: true },
      'Failed to update password'
    );
  }

  /**
   * Search for products
   */
  async searchProducts(query: string, filters?: SearchFilters): Promise<SearchResult> {
    // Use the mock data utility for development fallback
    const mockSearchResult = getMockSearchResults(query);

    return this.handleRequest<SearchResult>(
      () => this.api.post('/search', { query, filters }),
      mockSearchResult,
      'Failed to search for products'
    );
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(): Promise<string[]> {
    const mockRecentSearches = ["wireless headphones", "noise cancelling", "gaming headset"];

    return this.handleRequest<string[]>(
      () => this.api.get('/search/recent'),
      mockRecentSearches,
      'Failed to fetch recent searches'
    );
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(): Promise<string[]> {
    const mockPopularSearches = ["wireless earbuds", "bluetooth speaker", "gaming headset", "noise cancelling headphones"];

    return this.handleRequest<string[]>(
      () => this.api.get('/search/popular'),
      mockPopularSearches,
      'Failed to fetch popular searches'
    );
  }

  /**
   * Get user favorites
   */
  async getFavorites(): Promise<Product[]> {
    const mockFavorites: Product[] = [
      {
        id: 1,
        name: "Premium Wireless Headphones",
        brand: "SoundMaster",
        category: "Electronics",
        description: "Experience crystal-clear audio with our premium wireless headphones.",
        price: 249.99,
        rating: 4.7,
        reviewCount: 1243,
        sentimentScore: 0.85,
        imageUrl: "https://source.unsplash.com/random/300x300/?headphones",
        features: {
          "Sound Quality": { value: "Excellent", score: 0.92 },
          "Battery Life": { value: "30 hours", score: 0.88 }
        },
        pros: ["Exceptional sound clarity", "Long battery life"],
        cons: ["Expensive", "Occasional Bluetooth connectivity issues"]
      }
    ];

    return this.handleRequest<Product[]>(
      () => this.api.get('/search/favorites'),
      mockFavorites,
      'Failed to fetch favorites'
    );
  }

  /**
   * Add product to favorites
   */
  async addFavorite(productId: number): Promise<{ success: boolean }> {
    return this.handleRequest<{ success: boolean }>(
      () => this.api.post(`/search/favorites/${productId}`),
      { success: true },
      'Failed to add product to favorites'
    );
  }

  /**
   * Remove product from favorites
   */
  async removeFavorite(productId: number): Promise<{ success: boolean }> {
    return this.handleRequest<{ success: boolean }>(
      () => this.api.delete(`/search/favorites/${productId}`),
      { success: true },
      'Failed to remove product from favorites'
    );
  }

  /**
   * Get product details
   */
  async getProductDetails(productId: number): Promise<Product> {
    // Use the mock data utility for development fallback
    const mockProduct = getMockProduct(productId);

    return this.handleRequest<Product>(
      () => this.api.get(`/products/${productId}`),
      mockProduct,
      'Failed to fetch product details'
    );
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    // Use the mock data utility for development fallback
    const mockTrendingProducts = getMockTrendingProducts(limit);

    return this.handleRequest<Product[]>(
      () => this.api.get('/recommendations/trending', { params: { limit } }),
      mockTrendingProducts,
      'Failed to fetch trending products'
    );
  }

  /**
   * Get trend analysis data
   */
  async getTrendAnalysis(productId?: number, period: string = 'month'): Promise<any> {
    // Use the mock data utility for development fallback
    const mockTrendData = getMockTrendData(productId || 1, period);

    return this.handleRequest<any>(
      () => this.api.get(`/trends/all/${productId}?period=${period}`),
      mockTrendData,
      'Failed to fetch trend data'
    );
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<Notification[]> {
    // Mock data for development fallback
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "New Product Alert",
        message: "SoundMaster just released their new XM5 headphones!",
        type: "info",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: "2",
        title: "Price Drop",
        message: "AudioPro Studio Headphones are now 20% off!",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
      },
      {
        id: "3",
        title: "Review Sentiment Alert",
        message: "Recent reviews for Wireless Earbuds show declining sentiment.",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    return this.handleRequest<Notification[]>(
      () => this.api.get('/notifications'),
      mockNotifications,
      'Failed to fetch notifications'
    );
  }

  /**
   * Generic GET method
   */
  async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const response = await this.api.get(url, config);
      return response;
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
