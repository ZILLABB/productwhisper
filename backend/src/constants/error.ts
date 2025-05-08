/**
 * Error Constants
 * 
 * This file contains constants related to errors.
 */

/**
 * Error codes
 */
export const ERROR_CODES = {
  // General errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // File errors
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  // General errors
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input',
  [ERROR_CODES.VALIDATION_FAILED]: 'Validation failed',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Resource already exists',
  
  // Authentication errors
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized',
  [ERROR_CODES.FORBIDDEN]: 'Forbidden',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Token has expired',
  [ERROR_CODES.TOKEN_INVALID]: 'Invalid token',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials',
  
  // Database errors
  [ERROR_CODES.DATABASE_ERROR]: 'Database error',
  [ERROR_CODES.QUERY_FAILED]: 'Query failed',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed',
  
  // File errors
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'File upload failed',
  [ERROR_CODES.FILE_NOT_FOUND]: 'File not found',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type',
  
  // Rate limiting errors
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  
  // External service errors
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ERROR_CODES.API_UNAVAILABLE]: 'API is unavailable',
};

export default {
  ERROR_CODES,
  ERROR_MESSAGES,
};
