require('dotenv').config();
const { Pool, types } = require('pg');
types.setTypeParser(1082, (str) => str);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    console.log('Setting max_guests = 42 for wedding id 1');
    await pool.query('UPDATE weddings SET max_guests = $1 WHERE id = $2', [42, 1]);
    const res = await pool.query('SELECT id, couple_names, max_guests FROM weddings WHERE id = $1', [1]);
    console.log('After update:', res.rows[0]);
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await pool.end();
  }
}

run();
