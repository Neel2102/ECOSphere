// Creates (or reports) the admin account, since signup never offers the admin
// role. Usage: npm run seed:admin  (values come from ADMIN_* env vars or defaults)
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('../src/config/db');

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
const fullName = process.env.ADMIN_NAME || 'System Admin';
const phone = process.env.ADMIN_PHONE || '+919999999999';

async function seed() {
  await initDb();

  const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (rows.length > 0) {
    console.log(`[seed] Admin already exists: ${email}`);
  } else {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, is_verified)
       VALUES ($1, LOWER($2), $3, $4, 'admin', TRUE)`,
      [fullName, email, await bcrypt.hash(password, 10), phone]
    );
    console.log(`[seed] Admin created: ${email} / ${password}`);
    console.log('[seed] Change this password after first login.');
  }
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
