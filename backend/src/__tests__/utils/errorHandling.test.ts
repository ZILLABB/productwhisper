/**
 * Error Handling Utility Tests
 * 
 * This file contains tests for the error handling utility functions.
 */

import { 
  AppError, 
  asyncHandler,
  createNotFoundError,
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createInternalServerError
} from '../../utils/errorHandling';
import { STATUS_CODES } from '../../constants/api';
import { ERROR_CODES } from '../../constants/error';
import { Request, Response, NextFunction } from 'express';

describe('Error Handling Utility', () => {
  describe('AppError', () => {
    it('should create an error with the provided properties', () => {
      const error = new AppError(
        'Resource not found',
        STATUS_CODES.NOT_FOUND,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        { resource: 'User', id: 1 }
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(STATUS_CODES.NOT_FOUND);
      expect(error.errorCode).toBe(ERROR_CODES.RESOURCE_NOT_FOUND);
      expect(error.details).toEqual({ resource: 'User', id: 1 });
    });
    
    it('should create an error with default properties', () => {
      const error = new AppError('Internal server error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
      expect(error.details).toBeUndefined();
    });
  });
  
  describe('asyncHandler', () => {
    it('should pass error to next function when async function throws', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;
      
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      
      const handler = asyncHandler(asyncFn);
      await handler(mockRequest, mockResponse, mockNext);
      
      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
    
    it('should not call next when async function resolves', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;
      
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      
      const handler = asyncHandler(asyncFn);
      await handler(mockRequest, mockResponse, mockNext);
      
      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  
  describe('Error Factory Functions', () => {
    it('should create a not found error', () => {
      const error = createNotFoundError('User');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(STATUS_CODES.NOT_FOUND);
      expect(error.errorCode).toBe(ERROR_CODES.RESOURCE_NOT_FOUND);
    });
    
    it('should create a bad request error', () => {
      const error = createBadRequestError('Invalid input');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(STATUS_CODES.BAD_REQUEST);
      expect(error.errorCode).toBe(ERROR_CODES.INVALID_INPUT);
    });
    
    it('should create an unauthorized error', () => {
      const error = createUnauthorizedError('Invalid credentials');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(STATUS_CODES.UNAUTHORIZED);
      expect(error.errorCode).toBe(ERROR_CODES.UNAUTHORIZED);
    });
    
    it('should create a forbidden error', () => {
      const error = createForbiddenError('Insufficient permissions');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(STATUS_CODES.FORBIDDEN);
      expect(error.errorCode).toBe(ERROR_CODES.FORBIDDEN);
    });
    
    it('should create a conflict error', () => {
      const error = createConflictError('Resource already exists');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(STATUS_CODES.CONFLICT);
      expect(error.errorCode).toBe(ERROR_CODES.RESOURCE_CONFLICT);
    });
    
    it('should create an internal server error', () => {
      const error = createInternalServerError('Something went wrong');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(STATUS_CODES.INTERNAL_SERVER_ERROR);
      expect(error.errorCode).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR);
    });
  });
});
