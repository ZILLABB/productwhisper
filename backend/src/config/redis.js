const redis = require("redis");
require("dotenv").config();

// Create a mock Redis client for development
const createMockRedisClient = () => {
  const cache = new Map();

  return {
    connect: async () => {
      console.log("Mock Redis connected");
      return true;
    },
    disconnect: async () => {
      console.log("Mock Redis disconnected");
      return true;
    },
    set: async (key, value, options = {}) => {
      console.log("Mock Redis SET:", {
        key,
        value: value.substring(0, 50) + "...",
      });
      cache.set(key, {
        value,
        expiry: options.EX ? Date.now() + options.EX * 1000 : null,
      });
      return "OK";
    },
    get: async (key) => {
      console.log("Mock Redis GET:", { key });
      const item = cache.get(key);

      if (!item) return null;

      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }

      return item.value;
    },
    del: async (key) => {
      console.log("Mock Redis DEL:", { key });
      return cache.delete(key) ? 1 : 0;
    },
    flushAll: async () => {
      console.log("Mock Redis FLUSHALL");
      cache.clear();
      return "OK";
    },
  };
};

// Use real Redis client in production, mock in development
const redisClient =
  process.env.USE_MOCK_REDIS === "true"
    ? createMockRedisClient()
    : redis.createClient({
        url: process.env.REDIS_URL,
      });

// Connect to Redis
const connectRedis = async () => {
  try {
    if (process.env.USE_MOCK_REDIS === "true") {
      console.log("Using mock Redis");
      return true;
    }

    await redisClient.connect();
    console.log("Redis connection successful");
    return true;
  } catch (error) {
    console.error("Redis connection error:", error.message);

    if (process.env.NODE_ENV !== "production") {
      console.log("Falling back to mock Redis");
      process.env.USE_MOCK_REDIS = "true";

      // Replace the real client with a mock one
      Object.assign(redisClient, createMockRedisClient());
      return true;
    }

    return false;
  }
};

// Disconnect from Redis
const disconnectRedis = async () => {
  try {
    if (process.env.USE_MOCK_REDIS === "true") {
      console.log("Mock Redis disconnected");
      return true;
    }

    await redisClient.disconnect();
    console.log("Redis disconnected");
    return true;
  } catch (error) {
    console.error("Redis disconnect error:", error.message);
    return false;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};
