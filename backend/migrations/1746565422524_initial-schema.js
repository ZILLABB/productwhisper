/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Users table
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    password_hash: { type: "varchar(255)", notNull: true },
    username: { type: "varchar(100)", notNull: true, unique: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    last_login: { type: "timestamp" },
    preferences: { type: "jsonb" },
  });

  // Products table
  pgm.createTable("products", {
    id: "id",
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text" },
    category: { type: "varchar(100)" },
    image_url: { type: "varchar(255)" },
    external_ids: { type: "jsonb" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Product scores table
  pgm.createTable("product_scores", {
    id: "id",
    product_id: {
      type: "integer",
      references: "products",
      onDelete: "CASCADE",
    },
    overall_score: { type: "decimal(3,2)" },
    reddit_score: { type: "decimal(3,2)" },
    amazon_score: { type: "decimal(3,2)" },
    youtube_score: { type: "decimal(3,2)" },
    confidence_score: { type: "decimal(3,2)" },
    sample_size: { type: "integer" },
    last_updated: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Product mentions/reviews
  pgm.createTable("product_mentions", {
    id: "id",
    product_id: {
      type: "integer",
      references: "products",
      onDelete: "CASCADE",
    },
    source: { type: "varchar(50)", notNull: true },
    source_id: { type: "varchar(255)", notNull: true },
    content: { type: "text" },
    sentiment_score: { type: "decimal(3,2)" },
    url: { type: "varchar(255)" },
    created_at: { type: "timestamp" },
    processed_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // User searches
  pgm.createTable("user_searches", {
    id: "id",
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "CASCADE",
    },
    query: { type: "varchar(255)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    results_count: { type: "integer" },
  });

  // User favorites
  pgm.createTable("user_favorites", {
    id: "id",
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "CASCADE",
    },
    product_id: {
      type: "integer",
      references: "products",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add unique constraint to user_favorites
  pgm.addConstraint("user_favorites", "user_favorites_user_id_product_id_key", {
    unique: ["user_id", "product_id"],
  });

  // Create indexes for better performance
  pgm.createIndex("product_mentions", "product_id");
  pgm.createIndex("product_scores", "product_id");
  pgm.createIndex("user_searches", "user_id");
  pgm.createIndex("user_favorites", "user_id");
  pgm.createIndex("user_favorites", "product_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop tables in reverse order to avoid foreign key constraints
  pgm.dropTable("user_favorites");
  pgm.dropTable("user_searches");
  pgm.dropTable("product_mentions");
  pgm.dropTable("product_scores");
  pgm.dropTable("products");
  pgm.dropTable("users");
};
