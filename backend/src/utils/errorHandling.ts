/**
 * Error Handling Utility
 * 
 * This file contains utility functions for error handling.
 */

import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from '../constants/api';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/error';

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;
  
  /**
   * Create a new application error
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param errorCode - Error code
   * @param details - Additional error details
   */
  constructor(
    message: string,
    statusCode: number = STATUS_CODES.INTERNAL_SERVER_ERROR,
    errorCode: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create a not found error
 * @param resource - Resource name
 * @param id - Resource ID
 * @returns Not found error
 */
export const createNotFoundError = (resource: string, id?: number | string) => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new AppError(
    message,
    STATUS_CODES.NOT_FOUND,
    ERROR_CODES.RESOURCE_NOT_FOUND,
    { resource, id }
  );
};

/**
 * Create a bad request error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Bad request error
 */
export const createBadRequestError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.BAD_REQUEST,
    ERROR_CODES.INVALID_INPUT,
    details
  );
};

/**
 * Create an unauthorized error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Unauthorized error
 */
export const createUnauthorizedError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.UNAUTHORIZED,
    ERROR_CODES.UNAUTHORIZED,
    details
  );
};

/**
 * Create a forbidden error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Forbidden error
 */
export const createForbiddenError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.FORBIDDEN,
    ERROR_CODES.FORBIDDEN,
    details
  );
};

/**
 * Create a conflict error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Conflict error
 */
export const createConflictError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.CONFLICT,
    ERROR_CODES.RESOURCE_CONFLICT,
    details
  );
};

/**
 * Create an internal server error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Internal server error
 */
export const createInternalServerError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    details
  );
};

/**
 * Create a validation error
 * @param errors - Validation errors
 * @returns Validation error
 */
export const createValidationError = (errors: any[]) => {
  return new AppError(
    'Validation failed',
    STATUS_CODES.UNPROCESSABLE_ENTITY,
    ERROR_CODES.VALIDATION_FAILED,
    { errors }
  );
};

/**
 * Create a database error
 * @param message - Error message
 * @param details - Additional error details
 * @returns Database error
 */
export const createDatabaseError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.DATABASE_ERROR,
    details
  );
};

/**
 * Create an external service error
 * @param message - Error message
 * @param details - Additional error details
 * @returns External service error
 */
export const createExternalServiceError = (message: string, details?: any) => {
  return new AppError(
    message,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    details
  );
};

export default {
  AppError,
  asyncHandler,
  createNotFoundError,
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createInternalServerError,
  createValidationError,
  createDatabaseError,
  createExternalServiceError,
};
