require('dotenv').config();
const { Pool, types } = require('pg');
types.setTypeParser(1082, (str) => str);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const FIRST_NAMES = [
  'David','Sarah','Jacob','Rachel','Leah','Aaron','Miriam','Samuel','Daniel','Esther',
  'Rebecca','Benjamin','Isaac','Hannah','Ruth','Joel','Gideon','Naomi','Moshe','Eli',
  'Talia','Ariel','Shira','Isaiah','Eliana'
];

const LAST_NAMES = [
  'Cohen','Levy','Goldberg','Friedman','Kaplan','Katz','Rosen','Stein','Greenberg','Shapiro',
  'Weiss','Adler','Rubin','Silverman','Bernstein','Horowitz','Stern','Abramson','Mandel','Rosenberg'
];

const STATUSES = [
  { v: 'Pending', w: 30 },
  { v: 'Yes', w: 40 },
  { v: 'No', w: 10 },
  { v: 'Maybe', w: 20 }
];

function weightedChoice(arr) {
  const total = arr.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of arr) {
    if (r < item.w) return item.v;
    r -= item.w;
  }
  return arr[arr.length-1].v;
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function run() {
  const weddingId = Number(process.argv[2]) || 1;
  const count = Number(process.argv[3]) || 100;
  console.log(`Seeding ${count} guests for wedding id ${weddingId} ...`);

  try {
    const tRes = await pool.query('SELECT id, name, capacity FROM tables WHERE wedding_id = $1', [weddingId]);
    const tables = tRes.rows;

    const mRes = await pool.query("SELECT name FROM users WHERE wedding_id = $1 AND role = 'admin'", [weddingId]);
    const admins = mRes.rows.map(r => r.name);

    const fromChoices = ['Wedding', ...admins];

    for (let i = 0; i < count; i++) {
      const first_name = rnd(FIRST_NAMES);
      const last_name = rnd(LAST_NAMES);
      const is_confirmed = weightedChoice(STATUSES);

      // choose side/from: 60% Wedding, 40% random admin if any
      let side;
      if (admins.length === 0) side = 'Wedding';
      else side = Math.random() < 0.6 ? 'Wedding' : (`From ${rnd(admins)}`);

      // assign table: 50% chance to assign to a random table (if tables exist)
      let table_id = null;
      if (tables.length > 0 && Math.random() < 0.5) {
        table_id = rnd(tables).id;
      }

      await pool.query(
        'INSERT INTO guests (wedding_id, first_name, last_name, side, table_id, is_confirmed) VALUES ($1,$2,$3,$4,$5,$6)',
        [weddingId, first_name, last_name, side, table_id, is_confirmed]
      );

      if ((i+1) % 20 === 0) console.log(`  inserted ${i+1}`);
    }

    const summary = await pool.query(
      `SELECT 
         COUNT(*) AS total,
         SUM(CASE WHEN is_confirmed='Yes' THEN 1 ELSE 0 END) AS yes_count,
         SUM(CASE WHEN is_confirmed='No' THEN 1 ELSE 0 END) AS no_count,
         SUM(CASE WHEN is_confirmed='Maybe' THEN 1 ELSE 0 END) AS maybe_count,
         SUM(CASE WHEN is_confirmed='Pending' THEN 1 ELSE 0 END) AS pending_count
       FROM guests WHERE wedding_id = $1`, [weddingId]
    );

    console.log('Done. Summary:', summary.rows[0]);
  } catch (e) {
    console.error('ERROR seeding guests', e);
  } finally {
    await pool.end();
  }
}

run();
