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
  // Create notifications table
  pgm.createTable("notifications", {
    id: "id",
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "CASCADE",
      notNull: true,
    },
    type: {
      type: "varchar(50)",
      notNull: true,
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    message: {
      type: "text",
      notNull: true,
    },
    data: {
      type: "jsonb",
    },
    priority: {
      type: "varchar(20)",
      notNull: true,
      default: "medium",
    },
    read: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes
  pgm.createIndex("notifications", "user_id");
  pgm.createIndex("notifications", ["user_id", "read"]);
  pgm.createIndex("notifications", ["user_id", "type"]);
  pgm.createIndex("notifications", "created_at");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("notifications");
};
