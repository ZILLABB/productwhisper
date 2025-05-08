import promClient from 'prom-client';
import responseTime from 'response-time';
import logger from './loggerService';

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

// API endpoint response time summary
const apiResponseTime = new promClient.Summary({
  name: 'api_response_time',
  help: 'Response time of API endpoints',
  labelNames: ['method', 'route'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  registers: [register],
});

// Database query counter
const dbQueriesTotal = new promClient.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'success'],
  registers: [register],
});

// Database query duration histogram
const dbQueryDurationMicroseconds = new promClient.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
  registers: [register],
});

// Cache hit/miss counter
const cacheOperationsTotal = new promClient.Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result'],
  registers: [register],
});

// External API request counter
const externalApiRequestsTotal = new promClient.Counter({
  name: 'external_api_requests_total',
  help: 'Total number of external API requests',
  labelNames: ['api', 'method', 'success'],
  registers: [register],
});

// External API request duration histogram
const externalApiRequestDurationMicroseconds = new promClient.Histogram({
  name: 'external_api_request_duration_ms',
  help: 'Duration of external API requests in ms',
  labelNames: ['api', 'method'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

// Active users gauge
const activeUsersGauge = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  registers: [register],
});

/**
 * Middleware to measure HTTP request metrics
 */
export const metricsMiddleware = responseTime((req: any, res: any, time: number) => {
  // Skip metrics endpoint
  if (req.path === '/metrics') return;
  
  // Get route pattern (replace IDs with placeholders)
  const route = req.route ? req.route.path : req.path;
  const path = route.replace(/\/:[^/]+/g, '/:id');
  
  // Record metrics
  httpRequestsTotal.inc({
    method: req.method,
    route: path,
    status_code: res.statusCode
  });
  
  httpRequestDurationMicroseconds.observe(
    {
      method: req.method,
      route: path,
      status_code: res.statusCode
    },
    time
  );
  
  // Record API response time for API endpoints
  if (req.path.startsWith('/api')) {
    apiResponseTime.observe(
      {
        method: req.method,
        route: path
      },
      time
    );
  }
});

/**
 * Track database query
 * @param operation - Query operation (select, insert, update, delete)
 * @param success - Whether the query was successful
 * @param duration - Query duration in milliseconds
 */
export const trackDbQuery = (operation: string, success: boolean, duration: number) => {
  dbQueriesTotal.inc({
    operation,
    success: success.toString()
  });
  
  dbQueryDurationMicroseconds.observe(
    {
      operation
    },
    duration
  );
  
  // Log slow queries
  if (duration > 100) {
    logger.warn(`Slow database query: ${operation} took ${duration}ms`);
  }
};

/**
 * Track cache operation
 * @param operation - Cache operation (get, set, delete)
 * @param result - Result of the operation (hit, miss, success, error)
 */
export const trackCacheOperation = (operation: string, result: string) => {
  cacheOperationsTotal.inc({
    operation,
    result
  });
};

/**
 * Track external API request
 * @param api - API name (reddit, amazon, youtube)
 * @param method - HTTP method
 * @param success - Whether the request was successful
 * @param duration - Request duration in milliseconds
 */
export const trackExternalApiRequest = (
  api: string,
  method: string,
  success: boolean,
  duration: number
) => {
  externalApiRequestsTotal.inc({
    api,
    method,
    success: success.toString()
  });
  
  externalApiRequestDurationMicroseconds.observe(
    {
      api,
      method
    },
    duration
  );
  
  // Log slow API requests
  if (duration > 1000) {
    logger.warn(`Slow external API request: ${api} ${method} took ${duration}ms`);
  }
};

/**
 * Update active users count
 * @param count - Number of active users
 */
export const updateActiveUsers = (count: number) => {
  activeUsersGauge.set(count);
};

/**
 * Get metrics endpoint handler
 */
export const getMetrics = async (req: any, res: any) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics:', error);
    res.status(500).end();
  }
};

export default {
  metricsMiddleware,
  trackDbQuery,
  trackCacheOperation,
  trackExternalApiRequest,
  updateActiveUsers,
  getMetrics
};
