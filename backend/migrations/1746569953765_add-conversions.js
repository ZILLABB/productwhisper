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
  // Create conversions table
  pgm.createTable("conversions", {
    id: "id",
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "SET NULL",
    },
    session_id: {
      type: "varchar(255)",
      notNull: true,
    },
    product_id: {
      type: "integer",
      references: "products",
      onDelete: "CASCADE",
      notNull: true,
    },
    source: {
      type: "varchar(50)",
      notNull: true,
    },
    type: {
      type: "varchar(50)",
      notNull: true,
    },
    url: {
      type: "text",
      notNull: true,
    },
    revenue: {
      type: "decimal(10,2)",
      default: 0,
      notNull: true,
    },
    data: {
      type: "jsonb",
    },
    ip_address: {
      type: "varchar(50)",
    },
    user_agent: {
      type: "text",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes
  pgm.createIndex("conversions", "user_id");
  pgm.createIndex("conversions", "session_id");
  pgm.createIndex("conversions", "product_id");
  pgm.createIndex("conversions", "source");
  pgm.createIndex("conversions", "type");
  pgm.createIndex("conversions", "created_at");
  pgm.createIndex("conversions", ["product_id", "source"]);
  pgm.createIndex("conversions", ["user_id", "product_id"]);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("conversions");
};
