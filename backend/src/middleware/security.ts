import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import logger from '../services/loggerService';

/**
 * Rate limiting middleware
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many requests from this IP, please try again after 15 minutes',
        status: 429,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * More strict rate limiting for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again after an hour',
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: {
        message: 'Too many authentication attempts, please try again after an hour',
        status: 429,
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * CSRF protection middleware
 */
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

/**
 * CSRF error handler
 */
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn(`CSRF attack detected from IP: ${req.ip}`);
    return res.status(403).json({
      error: {
        message: 'Invalid CSRF token',
        status: 403,
        timestamp: new Date().toISOString()
      }
    });
  }
  next(err);
};

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'cdn.jsdelivr.net', '*.amazonaws.com'],
      connectSrc: ["'self'", 'api.productwhisper.com']
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});

/**
 * HTTP Parameter Pollution protection
 */
export const parameterPollutionProtection = hpp();

/**
 * Cookie parser middleware
 */
export const cookieParserMiddleware = cookieParser();

/**
 * Apply all security middleware to an Express app
 * @param app - Express app
 */
export const applySecurityMiddleware = (app: any) => {
  // Apply security headers
  app.use(securityHeaders);
  
  // Parse cookies
  app.use(cookieParserMiddleware);
  
  // Prevent parameter pollution
  app.use(parameterPollutionProtection);
  
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
  
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth/', authLimiter);
  
  // Apply CSRF protection to all routes that change state
  // Exclude API routes that need to be accessed by external clients
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for API routes and GET/HEAD/OPTIONS requests
    if (
      req.path.startsWith('/api/') ||
      ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    ) {
      return next();
    }
    
    // Apply CSRF protection
    csrfProtection(req, res, next);
  });
  
  // Handle CSRF errors
  app.use(csrfErrorHandler);
  
  // Add CSRF token to response locals for templates
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.csrfToken) {
      res.locals.csrfToken = req.csrfToken();
    }
    next();
  });
};
