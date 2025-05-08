const { Pool } = require("pg");
require("dotenv").config();

// Create a mock pool for development without a database
const createMockPool = () => {
  return {
    query: async (text, params) => {
      console.log("Mock DB Query:", { text, params });
      // Return mock data based on the query
      if (text.includes("INSERT INTO user_searches")) {
        return { rows: [], rowCount: 1 };
      }
      if (text.includes("SELECT * FROM users WHERE email")) {
        return {
          rows: [
            {
              id: 1,
              username: "testuser",
              email: "test@example.com",
              password_hash:
                "$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsrTQTJmLVRLxLW0Gv6o3kzUlCcXS", // 'password'
              created_at: new Date(),
              last_login: null,
              preferences: null,
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    },
    connect: async () => {
      console.log("Mock DB connected");
      return {
        release: () => {},
      };
    },
  };
};

// Use real pool in production, mock in development without DB
const pool =
  process.env.USE_MOCK_DB === "true"
    ? createMockPool()
    : new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      });

// Test the database connection
const testConnection = async () => {
  try {
    if (process.env.USE_MOCK_DB === "true") {
      console.log("Using mock database");
      return true;
    }

    const client = await pool.connect();
    console.log("Database connection successful");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection error:", error.message);

    if (process.env.NODE_ENV !== "production") {
      console.log("Falling back to mock database");
      process.env.USE_MOCK_DB = "true";
      return true;
    }

    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
};
