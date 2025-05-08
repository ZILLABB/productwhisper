/**
 * Server Configuration
 * 
 * This file contains server configuration functions.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import logger from '../utils/logger';

/**
 * Configure Express server
 * @param app - Express application
 */
export const configureServer = (app: Application): void => {
  // Enable CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  
  // Set security headers
  app.use(helmet());
  
  // Enable compression
  app.use(compression());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Parse cookies
  app.use(cookieParser());
  
  // Set up logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }
  
  // Set up rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });
  
  // Apply rate limiting to all routes
  app.use(limiter);
  
  // Set up Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ProductWhisper API Documentation',
  }));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
};

/**
 * Start Express server
 * @param app - Express application
 * @param port - Port number
 */
export const startServer = (app: Application, port: number): void => {
  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
  
  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
    } else {
      logger.error(`Server error: ${error.message}`);
    }
    process.exit(1);
  });
  
  // Handle process termination
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
};

export default {
  configureServer,
  startServer,
};
