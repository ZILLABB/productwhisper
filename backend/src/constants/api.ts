/**
 * API Constants
 * 
 * This file contains constants related to the API.
 */

/**
 * API prefix
 */
export const API_PREFIX = '/api/v1';

/**
 * HTTP status codes
 */
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * API response messages
 */
export const RESPONSE_MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  CONFLICT: 'Resource already exists',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  
  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFICATION_SENT: 'Email verification sent',
  EMAIL_VERIFIED: 'Email verified successfully',
};

/**
 * API endpoints
 */
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    REFRESH_TOKEN: `${API_PREFIX}/auth/refresh`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
    VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_PREFIX}/user/profile`,
    PREFERENCES: `${API_PREFIX}/user/preferences`,
    FAVORITES: `${API_PREFIX}/user/favorites`,
  },
  
  // Product endpoints
  PRODUCT: {
    BASE: `${API_PREFIX}/products`,
    DETAIL: `${API_PREFIX}/products/:id`,
    RELATED: `${API_PREFIX}/products/:id/related`,
    REVIEWS: `${API_PREFIX}/products/:id/reviews`,
  },
  
  // Review endpoints
  REVIEW: {
    BASE: `${API_PREFIX}/reviews`,
    DETAIL: `${API_PREFIX}/reviews/:id`,
    HELPFUL: `${API_PREFIX}/reviews/:id/helpful`,
  },
  
  // Sentiment endpoints
  SENTIMENT: {
    ANALYZE: `${API_PREFIX}/sentiment/analyze`,
    COMPARE: `${API_PREFIX}/sentiment/compare`,
  },
  
  // Trend endpoints
  TREND: {
    BASE: `${API_PREFIX}/trends`,
    COMPARE: `${API_PREFIX}/trends/compare`,
    CATEGORIES: `${API_PREFIX}/trends/categories`,
    BRANDS: `${API_PREFIX}/trends/brands`,
  },
  
  // Comparison endpoints
  COMPARISON: {
    BASE: `${API_PREFIX}/compare`,
    DETAIL: `${API_PREFIX}/compare/:id`,
    SAVE: `${API_PREFIX}/compare/save`,
    USER: `${API_PREFIX}/compare/user`,
  },
};

export default {
  API_PREFIX,
  STATUS_CODES,
  RESPONSE_MESSAGES,
  ENDPOINTS,
};
