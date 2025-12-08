
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createTables() {
  try {
    console.log("Creating tables...");

    // Create Tables table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        wedding_id INTEGER REFERENCES weddings(id),
        name VARCHAR(100),
        capacity INTEGER DEFAULT 10
      );
    `);
    console.log("Created 'tables' table.");

    // Create Guests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        wedding_id INTEGER REFERENCES weddings(id),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_confirmed VARCHAR(20) DEFAULT 'Pending',
        table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
        side VARCHAR(100)
      );
    `);
    console.log("Created 'guests' table.");
    
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
}

createTables();
