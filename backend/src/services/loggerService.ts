import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for console logs
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define the format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
  
  // Error log file transport
  new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: fileFormat,
  }),
  
  // Combined log file transport
  new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

/**
 * Log HTTP requests
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const httpLogger = (req: any, res: any, next: any) => {
  // Start timer
  const start = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Get request method, URL, status code, and user agent
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    const userAgent = req.get('user-agent') || '';
    
    // Create log message
    const message = `${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`;
    
    // Log with appropriate level based on status code
    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

/**
 * Log API requests with detailed information
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const apiLogger = (req: any, res: any, next: any) => {
  // Only log API requests
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }
  
  // Start timer
  const start = Date.now();
  
  // Get request details
  const { method, originalUrl, ip, body, query, params } = req;
  const userId = req.user ? req.user.id : 'anonymous';
  
  // Create request log
  logger.info(`API Request: ${method} ${originalUrl} - User: ${userId} - IP: ${ip}`, {
    type: 'api_request',
    method,
    url: originalUrl,
    userId,
    ip,
    body: sanitizeData(body),
    query,
    params,
  });
  
  // Log when response is finished
  res.on('finish', () => {
    // Calculate response time
    const responseTime = Date.now() - start;
    
    // Get status code
    const { statusCode } = res;
    
    // Create response log
    logger.info(`API Response: ${method} ${originalUrl} ${statusCode} ${responseTime}ms - User: ${userId}`, {
      type: 'api_response',
      method,
      url: originalUrl,
      statusCode,
      responseTime,
      userId,
    });
  });
  
  next();
};

/**
 * Sanitize sensitive data for logging
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
const sanitizeData = (data: any): any => {
  if (!data) return data;
  
  // Create a copy to avoid modifying the original
  const sanitized = { ...data };
  
  // List of sensitive fields to mask
  const sensitiveFields = ['password', 'password_hash', 'token', 'refreshToken', 'credit_card', 'ssn'];
  
  // Mask sensitive fields
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

export default logger;
