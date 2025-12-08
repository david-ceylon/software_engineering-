
const { Pool, types } = require('pg');
types.setTypeParser(1082, (str) => str);
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function check() {
    try {
        const res = await pool.query("SELECT id, name, role, wedding_id FROM users");
        console.log("Users:", res.rows);
        
        if (res.rows.length > 0) {
            const weddingId = res.rows[0].wedding_id;
            console.log("Checking members for wedding_id:", weddingId);
            const members = await pool.query('SELECT id, name, role FROM users WHERE wedding_id = $1', [weddingId]);
            console.log("Members from DB:", members.rows);

            // Fetch from API
            console.log("Fetching from API...");
            const apiRes = await fetch(`http://127.0.0.1:5001/wedding/${weddingId}/members`);
            const apiJson = await apiRes.json();
            console.log("Members from API:", apiJson);
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
