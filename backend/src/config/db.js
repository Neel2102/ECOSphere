const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client:', err.message);
});

const query = (text, params) => pool.query(text, params);

// Applies schema.sql (idempotent) so a fresh database is usable immediately.
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log(`[db] Connected to "${env.db.database}" and schema is up to date.`);
}

module.exports = { pool, query, initDb };
