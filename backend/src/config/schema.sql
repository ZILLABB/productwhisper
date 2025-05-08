-- Drop tables if they exist (for development only)
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS user_searches;
DROP TABLE IF EXISTS product_mentions;
DROP TABLE IF EXISTS product_scores;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  preferences JSONB
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url VARCHAR(255),
  external_ids JSONB, -- Store IDs from external services (Amazon, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product scores table
CREATE TABLE product_scores (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  overall_score DECIMAL(3,2),
  reddit_score DECIMAL(3,2),
  amazon_score DECIMAL(3,2),
  youtube_score DECIMAL(3,2),
  confidence_score DECIMAL(3,2),
  sample_size INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product reviews/mentions
CREATE TABLE product_mentions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  source VARCHAR(50) NOT NULL, -- 'reddit', 'amazon', 'youtube'
  source_id VARCHAR(255) NOT NULL, -- ID in the source platform
  content TEXT,
  sentiment_score DECIMAL(3,2),
  url VARCHAR(255),
  created_at TIMESTAMP,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User searches
CREATE TABLE user_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  query VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  results_count INTEGER
);

-- User favorites
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_product_mentions_product_id ON product_mentions(product_id);
CREATE INDEX idx_product_scores_product_id ON product_scores(product_id);
CREATE INDEX idx_user_searches_user_id ON user_searches(user_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON user_favorites(product_id);
