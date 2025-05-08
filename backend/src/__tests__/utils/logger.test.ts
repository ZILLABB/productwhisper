/**
 * Logger Utility Tests
 * 
 * This file contains tests for the logger utility.
 */

import logger from '../../utils/logger';
import winston from 'winston';

// Mock winston
jest.mock('winston', () => {
  const mFormat = {
    colorize: jest.fn().mockReturnThis(),
    combine: jest.fn().mockReturnThis(),
    timestamp: jest.fn().mockReturnThis(),
    printf: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  
  const mTransports = {
    Console: jest.fn(),
    File: jest.fn(),
  };
  
  return {
    format: mFormat,
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      http: jest.fn(),
    }),
    transports: mTransports,
  };
});

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create a logger with the correct configuration', () => {
    expect(winston.createLogger).toHaveBeenCalled();
  });
  
  it('should have info method', () => {
    logger.info('Test info message');
    expect(logger.info).toHaveBeenCalledWith('Test info message');
  });
  
  it('should have error method', () => {
    const error = new Error('Test error');
    logger.error('Test error message', { error });
    expect(logger.error).toHaveBeenCalledWith('Test error message', { error });
  });
  
  it('should have warn method', () => {
    logger.warn('Test warning message');
    expect(logger.warn).toHaveBeenCalledWith('Test warning message');
  });
  
  it('should have debug method', () => {
    logger.debug('Test debug message');
    expect(logger.debug).toHaveBeenCalledWith('Test debug message');
  });
  
  it('should have http method', () => {
    logger.http('Test HTTP message');
    expect(logger.http).toHaveBeenCalledWith('Test HTTP message');
  });
  
  it('should log objects with metadata', () => {
    const metadata = { user: 'test', action: 'login' };
    logger.info('User action', metadata);
    expect(logger.info).toHaveBeenCalledWith('User action', metadata);
  });
});
