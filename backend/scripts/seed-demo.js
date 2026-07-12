// EcoSphere - Demo data seeder: departments, factors, goals, policies,
// challenges, activities, badges, rewards + sample transactions.
// Owner: dhrumil | Usage: npm run seed:demo   (idempotent - skips if data exists)
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('../src/config/db');

async function seed() {
  await initDb();

  // One dedicated client so BEGIN/COMMIT wrap every insert atomically.
  const client = await pool.connect();

  const { rows: existing } = await client.query('SELECT COUNT(*)::int AS count FROM departments');
  if (existing[0].count > 0) {
    console.log('[seed-demo] Departments already exist - nothing to do.');
    client.release();
    await pool.end();
    return;
  }

  console.log('[seed-demo] Seeding demo data...');
  await client.query('BEGIN');

  // Departments
  const { rows: departments } = await client.query(
    `INSERT INTO departments (name, code, employee_count) VALUES
     ('Sales', 'SALE', 12), ('Manufacturing', 'MFG', 30), ('Logistics', 'LOGI', 18),
     ('Corporate', 'CORP', 10), ('R&D', 'RD', 8)
     RETURNING id, name`
  );
  const dept = Object.fromEntries(departments.map((d) => [d.name, d.id]));

  // Demo employees (verified, password: Demo@1234)
  const hash = await bcrypt.hash('Demo@1234', 10);
  const { rows: users } = await client.query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, is_verified, department_id, gender) VALUES
     ('Aditi Rao', 'aditi.rao@example.com', $1, '+919810000001', 'employee', TRUE, $2, 'female'),
     ('Karan Shah', 'karan.shah@example.com', $1, '+919810000002', 'employee', TRUE, $3, 'male'),
     ('Priya Nair', 'priya.nair@example.com', $1, '+919810000003', 'employee', TRUE, $4, 'female'),
     ('Rohan Iyer', 'rohan.iyer@example.com', $1, '+919810000004', 'manager', TRUE, $5, 'male')
     RETURNING id, full_name`,
    [hash, dept['Manufacturing'], dept['Logistics'], dept['Corporate'], dept['R&D']]
  );
  const user = Object.fromEntries(users.map((u) => [u.full_name, u.id]));

  // Categories
  await client.query(
    `INSERT INTO categories (name, type) VALUES
     ('Community', 'csr_activity'), ('Environment', 'csr_activity'), ('Health', 'csr_activity'),
     ('Energy', 'challenge'), ('Waste', 'challenge'), ('Transport', 'challenge')`
  );
  const { rows: categories } = await client.query('SELECT id, name, type FROM categories');
  const cat = (name) => categories.find((c) => c.name === name).id;

  // Emission factors
  await client.query(
    `INSERT INTO emission_factors (name, source_type, unit, factor_value) VALUES
     ('Diesel (fleet)', 'fleet', 'litre', 2.68), ('Petrol (fleet)', 'fleet', 'litre', 2.31),
     ('Grid electricity', 'manufacturing', 'kWh', 0.82), ('Natural gas', 'manufacturing', 'm3', 1.89),
     ('Purchased steel', 'purchase', 'kg', 1.85), ('Air travel', 'expense', 'km', 0.15)`
  );
  const { rows: factors } = await client.query('SELECT id, name, factor_value FROM emission_factors');
  const factor = (name) => factors.find((f) => f.name === name);

  // Product ESG profiles
  await client.query(
    `INSERT INTO product_esg_profiles (product_name, sku, carbon_per_unit, recyclable, esg_rating) VALUES
     ('Eco Bottle 500ml', 'ECO-500', 0.42, TRUE, 'A'), ('Standard Crate', 'CRT-01', 3.10, TRUE, 'B'),
     ('Foam Packaging', 'PKG-F2', 5.65, FALSE, 'D')`
  );

  // Environmental goals
  await client.query(
    `INSERT INTO environmental_goals (name, department_id, target_co2, current_co2, deadline, status) VALUES
     ('Reduce Fleet Emissions', $1, 500, 640, '2026-12-31', 'active'),
     ('Cut Packaging Waste', $2, 120, 146, '2026-09-30', 'on_track'),
     ('Office Energy Cut', $3, 80, 80, '2026-06-30', 'completed')`,
    [dept['Logistics'], dept['Manufacturing'], dept['Corporate']]
  );

  // Carbon transactions (spread over recent months)
  const txValues = [];
  const params = [];
  let p = 1;
  const sources = [
    ['fleet', 'Diesel (fleet)', dept['Logistics']],
    ['manufacturing', 'Grid electricity', dept['Manufacturing']],
    ['purchase', 'Purchased steel', dept['Manufacturing']],
    ['expense', 'Air travel', dept['Corporate']],
  ];
  for (let month = 0; month < 8; month += 1) {
    for (const [source, factorName, departmentId] of sources) {
      const f = factor(factorName);
      const quantity = 100 + ((month * 37) % 160);
      txValues.push(`($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, CURRENT_DATE - INTERVAL '${month} months', TRUE)`);
      params.push(source, f.id, departmentId, quantity, Math.round(quantity * f.factor_value * 100) / 100);
    }
  }
  await client.query(
    `INSERT INTO carbon_transactions
       (source_type, emission_factor_id, department_id, quantity, co2_amount, transaction_date, auto_calculated)
     VALUES ${txValues.join(', ')}`,
    params
  );

  // ESG policies
  await client.query(
    `INSERT INTO esg_policies (title, description, version, effective_date, status) VALUES
     ('Anti-Corruption Policy', 'Zero tolerance for bribery and corruption.', '2.1', '2026-01-01', 'active'),
     ('Code of Conduct', 'Expected behaviour for all employees.', '3.0', '2026-01-01', 'active'),
     ('Data Privacy Policy', 'Handling of personal and customer data.', '1.4', '2026-03-01', 'active')`
  );
  const { rows: policies } = await client.query('SELECT id FROM esg_policies ORDER BY id');
  await client.query(
    'INSERT INTO policy_acknowledgements (policy_id, employee_id) VALUES ($1, $3), ($1, $4), ($2, $3)',
    [policies[0].id, policies[1].id, user['Aditi Rao'], user['Karan Shah']]
  );

  // Audits + compliance issues
  const { rows: audits } = await client.query(
    `INSERT INTO audits (title, department_id, auditor_name, audit_date, findings, status) VALUES
     ('Q2 Waste Audit', $1, 'S. Nair', '2026-06-12', '3 minor issues', 'completed'),
     ('Vendor Compliance Check', $2, 'R. Iyer', '2026-07-01', '1 open issue', 'under_review')
     RETURNING id`,
    [dept['Manufacturing'], dept['Corporate']]
  );
  await client.query(
    `INSERT INTO compliance_issues (title, audit_id, severity, department_id, owner_id, due_date, status) VALUES
     ('Missing MSDS sheets', $1, 'high', $3, $5, CURRENT_DATE + 14, 'open'),
     ('Late vendor disclosure', $2, 'medium', $4, $6, CURRENT_DATE - 3, 'resolved')`,
    [audits[0].id, audits[1].id, dept['Manufacturing'], dept['Corporate'], user['Rohan Iyer'], user['Rohan Iyer']]
  );

  // CSR activities
  const { rows: activities } = await client.query(
    `INSERT INTO csr_activities (title, category_id, description, activity_date, points, evidence_required, status) VALUES
     ('Tree Plantation', $1, 'Plant trees at the city park.', CURRENT_DATE + 7, 50, TRUE, 'open'),
     ('Blood Donation', $2, 'Quarterly blood donation camp.', CURRENT_DATE + 14, 40, TRUE, 'open'),
     ('Beach Cleanup', $1, 'Weekend cleanup drive.', CURRENT_DATE + 21, 45, FALSE, 'open'),
     ('ESG Workshop', $2, 'Half-day sustainability workshop.', CURRENT_DATE + 10, 30, FALSE, 'open')
     RETURNING id`,
    [cat('Environment'), cat('Health')]
  );
  await client.query(
    `INSERT INTO employee_participations (activity_id, employee_id, proof_path, approval_status, points_earned, completion_date) VALUES
     ($1, $2, 'uploads/evidence/demo-photo.jpg', 'pending', 0, NULL),
     ($3, $4, 'uploads/evidence/demo-cert.pdf', 'approved', 30, CURRENT_DATE - 2)`,
    [activities[0].id, user['Aditi Rao'], activities[3].id, user['Karan Shah']]
  );

  // Challenges
  const { rows: challenges } = await client.query(
    `INSERT INTO challenges (title, category_id, description, xp, difficulty, evidence_required, deadline, status) VALUES
     ('Sustainability Sprint', $1, 'Complete 5 eco-actions in a week.', 200, 'hard', TRUE, CURRENT_DATE + 8, 'active'),
     ('Recycle Challenge', $2, 'Recycle household waste for a week.', 80, 'easy', FALSE, CURRENT_DATE + 3, 'active'),
     ('Commute Green Week', $3, 'Use public transport or cycle all week.', 120, 'medium', TRUE, CURRENT_DATE + 13, 'draft'),
     ('Zero Waste Week', $2, 'Produce no landfill waste for a week.', 150, 'medium', TRUE, CURRENT_DATE - 10, 'completed')
     RETURNING id`,
    [cat('Energy'), cat('Waste'), cat('Transport')]
  );
  await client.query(
    `INSERT INTO challenge_participations (challenge_id, employee_id, progress, proof_path, approval_status, xp_awarded, completed_at) VALUES
     ($1, $3, 100, 'uploads/evidence/demo-zw.jpg', 'approved', 150, CURRENT_DATE - 8),
     ($2, $3, 40, NULL, 'pending', 0, NULL),
     ($2, $4, 60, NULL, 'pending', 0, NULL)`,
    [challenges[3].id, challenges[0].id, user['Priya Nair'], user['Aditi Rao']]
  );

  // Badges + rewards
  await client.query(
    `INSERT INTO badges (name, description, icon, unlock_rule_type, unlock_rule_value) VALUES
     ('Green Beginner', 'Earn your first 50 XP.', 'leaf', 'xp', 50),
     ('Carbon Saver', 'Reach 300 XP.', 'cloud', 'xp', 300),
     ('Sustainability Champion', 'Complete 3 challenges.', 'trophy', 'challenges_completed', 3),
     ('Team Player', 'Complete 1 challenge.', 'users', 'challenges_completed', 1)`
  );
  await client.query(
    `INSERT INTO rewards (name, description, points_required, stock) VALUES
     ('Coffee Voucher', 'Free coffee for a week.', 50, 20),
     ('Plant a Tree Kit', 'We plant a tree in your name.', 100, 15),
     ('Extra Day Off', 'One additional leave day.', 500, 5)`
  );

  await client.query('COMMIT');
  console.log('[seed-demo] Done. Demo users (password Demo@1234):');
  console.log('  aditi.rao@example.com / karan.shah@example.com / priya.nair@example.com (employees)');
  console.log('  rohan.iyer@example.com (manager)');
  client.release();
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed-demo] Failed:', err.message);
  process.exit(1);
});
