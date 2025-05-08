/**
 * Database initialization script
 * 
 * This script creates the database and runs the initial schema
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection parameters for the postgres database
const connectionParams = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

// Database name to create
const dbName = process.env.DB_NAME;

async function initializeDatabase() {
  // Connect to postgres database to create our application database
  const client = new Client(connectionParams);
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    
    // Check if database already exists
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (checkDbResult.rows.length === 0) {
      // Create database if it doesn't exist
      console.log(`Creating database: ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
    
    // Close connection to postgres
    await client.end();
    
    // Connect to the newly created database
    const dbClient = new Client({
      ...connectionParams,
      database: dbName
    });
    
    await dbClient.connect();
    console.log(`Connected to database: ${dbName}`);
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema.sql...');
    await dbClient.query(schemaSql);
    console.log('Schema created successfully');
    
    // Close connection
    await dbClient.end();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
