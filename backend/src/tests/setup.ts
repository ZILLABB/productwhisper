// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test_secret_key';
process.env.USE_MOCK_DB = 'true';
process.env.USE_MOCK_REDIS = 'true';

// Increase timeout for tests
jest.setTimeout(10000);
