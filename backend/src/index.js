const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Import configurations
const { testConnection } = require("./config/db");
const { connectRedis } = require("./config/redis");

// Import middleware
const { errorHandler, notFound } = require("./middleware/error");

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
// app.use('/api/products', require('./routes/products'));
app.use("/api/search", require("./routes/search"));
// app.use('/api/user', require('./routes/user'));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ProductWhisper API" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Connect to Redis
    await connectRedis();

    // Start the server
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
