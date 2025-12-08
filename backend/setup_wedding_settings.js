require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('Adding max_guests to weddings (if not exists)...');
    await pool.query(`ALTER TABLE weddings ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 0`);
    console.log('Done.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
