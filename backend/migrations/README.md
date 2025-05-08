# Database Migrations

This directory contains database migrations for the ProductWhisper application. We use [node-pg-migrate](https://github.com/salsita/node-pg-migrate) to manage database schema changes.

## Migration Files

- **1746565422524_initial-schema.js**: Initial database schema with users, products, product scores, product mentions, user searches, and user favorites tables.
- **1746565487353_add-user-roles.js**: Adds user roles functionality with roles and user_roles tables, and an is_active column to users.
- **1746565532507_add-product-tags.js**: Adds product tagging functionality with tags and product_tags tables, and price, brand, and average_rating columns to products.

## Running Migrations

To run migrations, use the following npm scripts:

```bash
# Run all pending migrations
npm run migrate:up

# Revert the last migration
npm run migrate:down

# Create a new migration
npm run migrate:create <migration-name>
```

## Migration Best Practices

1. **Always test migrations**: Before applying migrations to production, test them in a development or staging environment.
2. **Keep migrations small**: Each migration should make a small, focused change to the database schema.
3. **Always include down migrations**: Make sure each migration can be reverted by implementing the `down` function.
4. **Use transactions**: Migrations are run in transactions by default, which ensures that they are atomic.
5. **Be careful with data migrations**: When migrating data, be mindful of performance implications for large tables.

## Database Schema

The current database schema includes the following tables:

### Core Tables
- **users**: User accounts and authentication information
- **products**: Product information
- **product_scores**: Sentiment analysis scores for products
- **product_mentions**: Mentions of products from various sources
- **user_searches**: Search history for users
- **user_favorites**: Products favorited by users

### Role Management
- **roles**: Available user roles
- **user_roles**: Junction table linking users to roles

### Product Tagging
- **tags**: Available product tags
- **product_tags**: Junction table linking products to tags

## Adding a New Migration

To add a new migration:

1. Run `npm run migrate:create <migration-name>`
2. Edit the generated migration file in the `migrations` directory
3. Implement both `up` and `down` functions
4. Run `npm run migrate:up` to apply the migration

## Initializing the Database

To initialize a new database:

1. Make sure PostgreSQL is installed and running
2. Create a new database: `createdb productwhisper`
3. Run `npm run db:init` to initialize the database with the schema
4. Run `npm run migrate:up` to apply any pending migrations
