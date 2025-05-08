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
  // Create tags table
  pgm.createTable("tags", {
    id: "id",
    name: { type: "varchar(50)", notNull: true, unique: true },
    description: { type: "text" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create product_tags junction table
  pgm.createTable("product_tags", {
    id: "id",
    product_id: {
      type: "integer",
      references: "products",
      onDelete: "CASCADE",
      notNull: true,
    },
    tag_id: {
      type: "integer",
      references: "tags",
      onDelete: "CASCADE",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add unique constraint to prevent duplicate product-tag assignments
  pgm.addConstraint("product_tags", "product_tags_product_id_tag_id_key", {
    unique: ["product_id", "tag_id"],
  });

  // Create indexes
  pgm.createIndex("product_tags", "product_id");
  pgm.createIndex("product_tags", "tag_id");
  pgm.createIndex("tags", "name");

  // Add price and brand columns to products table
  pgm.addColumns("products", {
    price: {
      type: "decimal(10,2)",
    },
    brand: {
      type: "varchar(100)",
    },
    average_rating: {
      type: "decimal(3,2)",
    },
  });

  // Create index on brand for faster filtering
  pgm.createIndex("products", "brand");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop columns and tables in reverse order
  pgm.dropColumns("products", ["price", "brand", "average_rating"]);
  pgm.dropTable("product_tags");
  pgm.dropTable("tags");
};
