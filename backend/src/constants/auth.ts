/**
 * Authentication Constants
 * 
 * This file contains constants related to authentication.
 */

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Token types
 */
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification',
};

/**
 * Token expiration times (in seconds)
 */
export const TOKEN_EXPIRATION = {
  ACCESS: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900', 10), // 15 minutes
  REFRESH: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10), // 7 days
  RESET_PASSWORD: 3600, // 1 hour
  EMAIL_VERIFICATION: 86400, // 24 hours
};

/**
 * Password settings
 */
export const PASSWORD_SETTINGS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
  SALT_ROUNDS: 10,
};

/**
 * Cookie options
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  MAX_AGE: TOKEN_EXPIRATION.REFRESH * 1000, // Convert to milliseconds
};

export default {
  USER_ROLES,
  TOKEN_TYPES,
  TOKEN_EXPIRATION,
  PASSWORD_SETTINGS,
  COOKIE_OPTIONS,
};
