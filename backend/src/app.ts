import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { testConnection } from './config/db';
import { connectRedis } from './config/redis';
import swaggerSpecs from './config/swagger';
import apiRoutes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger, { httpLogger, apiLogger } from './services/loggerService';
import monitoring from './services/monitoringService';
import { applySecurityMiddleware } from './middleware/security';
import { initSentry, setupSentryRequestHandler, setupSentryErrorHandler } from './utils/sentry';

// Create Express app
const app = express();

// Initialize Sentry
initSentry(app);

// Set up Sentry request handler
setupSentryRequestHandler(app);

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://productwhisper.com', 'https://www.productwhisper.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
app.use(httpLogger); // HTTP request logging
app.use(apiLogger); // API request logging

// Monitoring middleware
app.use(monitoring.metricsMiddleware); // Prometheus metrics

// Apply security middleware
applySecurityMiddleware(app);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Metrics endpoint
app.get('/metrics', monitoring.getMetrics);

// API Routes
app.use('/api', apiRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ProductWhisper API' });
});

// Error handling
app.use(notFound);

// Set up Sentry error handler
setupSentryErrorHandler(app);

// Set up error handler
app.use(errorHandler);

// Initialize database and Redis
const initializeServices = async () => {
  logger.info('Initializing services...');

  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      logger.info('Database connection successful');
    } else {
      logger.warn('Database connection failed, using mock database');
    }

    // Connect to Redis
    const redisConnected = await connectRedis();
    if (redisConnected) {
      logger.info('Redis connection successful');
    } else {
      logger.warn('Redis connection failed, using mock Redis');
    }

    // Log environment information
    logger.info(`Server running in ${process.env.NODE_ENV} mode`);
    logger.info(`API Documentation available at /api-docs`);
    logger.info(`Metrics available at /metrics`);

    return true;
  } catch (error) {
    logger.error('Service initialization error:', error);
    return false;
  }
};

export { app, initializeServices };
