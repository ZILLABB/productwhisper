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
  // Create roles table
  pgm.createTable("roles", {
    id: "id",
    name: { type: "varchar(50)", notNull: true, unique: true },
    description: { type: "text" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create user_roles junction table
  pgm.createTable("user_roles", {
    id: "id",
    user_id: {
      type: "integer",
      references: "users",
      onDelete: "CASCADE",
      notNull: true,
    },
    role_id: {
      type: "integer",
      references: "roles",
      onDelete: "CASCADE",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add unique constraint to prevent duplicate user-role assignments
  pgm.addConstraint("user_roles", "user_roles_user_id_role_id_key", {
    unique: ["user_id", "role_id"],
  });

  // Create indexes
  pgm.createIndex("user_roles", "user_id");
  pgm.createIndex("user_roles", "role_id");

  // Insert default roles
  pgm.sql(`
    INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrator with full access'),
    ('moderator', 'Can moderate content and users'),
    ('user', 'Regular user with basic privileges')
  `);

  // Add is_active column to users table
  pgm.addColumn("users", {
    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop tables and columns in reverse order
  pgm.dropColumn("users", "is_active");
  pgm.dropTable("user_roles");
  pgm.dropTable("roles");
};
