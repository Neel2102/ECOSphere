// Seeder for EcoSphere Clean State with 1 Organization and 3 Roles
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function main() {
  const client = await pool.connect();
  try {
    console.log('Cleaning database tables...');
    await client.query('BEGIN');
    // Truncate all tables in cascade order
    await client.query(`
      TRUNCATE TABLE 
        reward_redemptions, employee_badges, compliance_issues, audits, 
        policy_acknowledgements, challenge_participations, challenges, 
        employee_participations, csr_activities, carbon_transactions, 
        esg_settings, rewards, badges, esg_policies, environmental_goals, 
        product_esg_profiles, emission_factors, categories, users, 
        departments, organizations 
      RESTART IDENTITY CASCADE
    `);

    console.log('Seeding 1 Organization (EcoCorp)...');
    const { rows: orgs } = await client.query(`
      INSERT INTO organizations (name, code)
      VALUES ('EcoCorp', 'ECOCORP')
      RETURNING id
    `);
    const orgId = orgs[0].id;

    console.log('Seeding ESG settings for EcoCorp...');
    await client.query(`
      INSERT INTO esg_settings (id, organization_id)
      VALUES (1, $1)
    `, [orgId]);

    console.log('Seeding Users (password: Demo@1234)...');
    const hash = await bcrypt.hash('Demo@1234', 10);

    // 1. Admin
    const { rows: admins } = await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, role, is_verified, organization_id)
      VALUES ('Admin User', 'admin@ecocorp.com', $1, '+919999999999', 'admin', TRUE, $2)
      RETURNING id
    `, [hash, orgId]);
    const adminId = admins[0].id;

    await client.query(`
      UPDATE organizations SET created_by = $1 WHERE id = $2
    `, [adminId, orgId]);

    // 2. Manager
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, role, is_verified, organization_id)
      VALUES ('Manager User', 'manager@ecocorp.com', $1, '+918888888888', 'manager', TRUE, $2)
    `, [hash, orgId]);

    // 3. Employee
    await client.query(`
      INSERT INTO users (full_name, email, password_hash, phone, role, is_verified, organization_id)
      VALUES ('Employee User', 'employee@ecocorp.com', $1, '+917777777777', 'employee', TRUE, $2)
    `, [hash, orgId]);

    // Seed Badges & Rewards
    console.log('Seeding Badge templates...');
    await client.query(`
      INSERT INTO badges (name, description, icon, unlock_rule_type, unlock_rule_value, organization_id) VALUES
      ('Green Star', 'Earn your first 50 XP.', 'leaf', 'xp', 50, $1),
      ('Eco Warrior', 'Complete 1 challenge.', 'trophy', 'challenges_completed', 1, $1)
    `, [orgId]);

    console.log('Seeding Reward templates...');
    await client.query(`
      INSERT INTO rewards (name, description, points_required, stock, organization_id) VALUES
      ('Coffee Voucher', 'Free organic coffee.', 50, 10, $1),
      ('Plant a Tree Kit', 'Plant a tree kit.', 100, 5, $1)
    `, [orgId]);

    console.log('Seeding Categories...');
    await client.query(`
      INSERT INTO categories (name, type, status, organization_id) VALUES
      ('Energy Conservation', 'challenge', 'active', $1),
      ('Waste Reduction', 'challenge', 'active', $1),
      ('Water Saving', 'challenge', 'active', $1),
      ('Green Commuting', 'challenge', 'active', $1),
      ('Community Volunteering', 'csr_activity', 'active', $1),
      ('Tree Plantation', 'csr_activity', 'active', $1),
      ('Education & Awareness', 'csr_activity', 'active', $1),
      ('Charity & Donation', 'csr_activity', 'active', $1)
    `, [orgId]);

    await client.query('COMMIT');
    console.log('Database successfully cleaned and seeded!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
