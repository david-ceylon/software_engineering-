require('dotenv').config();
const { Pool, types } = require('pg');
types.setTypeParser(1082, (str) => str);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    const res = await pool.query('SELECT id, couple_names, max_guests FROM weddings ORDER BY id ASC');
    console.log('Weddings:', res.rows);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await pool.end();
  }
}

run();
