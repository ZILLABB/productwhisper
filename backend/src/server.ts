import dotenv from 'dotenv';
import http from 'http';
import { app, initializeServices } from './app';
import logger from './services/loggerService';
import { socketService } from './services/socketService';

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 3000;

// Initialize services and start server
const startServer = async () => {
  try {
    logger.info('Starting ProductWhisper API server...');

    // Initialize database and Redis
    const initialized = await initializeServices();

    if (!initialized) {
      logger.error('Failed to initialize services');
      process.exit(1);
    }

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    socketService.initialize(httpServer);

    // Start server
    const server = httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`WebSocket server initialized`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
