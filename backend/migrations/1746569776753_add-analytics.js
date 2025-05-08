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
  // Create analytics_events table
  pgm.createTable("analytics_events", {
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
    event_type: {
      type: "varchar(50)",
      notNull: true,
    },
    page: {
      type: "varchar(255)",
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
  pgm.createIndex("analytics_events", "user_id");
  pgm.createIndex("analytics_events", "session_id");
  pgm.createIndex("analytics_events", "event_type");
  pgm.createIndex("analytics_events", "created_at");
  pgm.createIndex("analytics_events", ["user_id", "event_type"]);
  pgm.createIndex("analytics_events", ["session_id", "event_type"]);

  // Create GIN index for JSON data
  pgm.createIndex("analytics_events", "data", {
    method: "GIN",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("analytics_events");
};
