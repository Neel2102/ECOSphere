// EcoSphere - Badge master + awarded badges data access
// Owner: yagna
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'badges',
  writable: ['name', 'description', 'icon', 'unlock_rule_type', 'unlock_rule_value', 'status', 'organization_id'],
  order: 'unlock_rule_value ASC',
  search: ['name'],
});

async function listWithEarned(forUserId) {
  const { rows } = await query(
    `SELECT b.*,
            (SELECT COUNT(*) FROM employee_badges eb WHERE eb.badge_id = b.id)::int AS earned_count,
            EXISTS (SELECT 1 FROM employee_badges eb
                    WHERE eb.badge_id = b.id AND eb.employee_id = $1) AS earned_by_me
     FROM badges b
     WHERE b.organization_id = (SELECT organization_id FROM users WHERE id = $1)
     ORDER BY b.unlock_rule_value ASC`,
    [forUserId || 0]
  );
  return rows;
}

async function earnedBadgeIds(employeeId) {
  const { rows } = await query(
    'SELECT badge_id FROM employee_badges WHERE employee_id = $1',
    [employeeId]
  );
  return rows.map((row) => row.badge_id);
}

async function award(badgeId, employeeId) {
  const { rows } = await query(
    `INSERT INTO employee_badges (badge_id, employee_id)
     VALUES ($1, $2) ON CONFLICT (badge_id, employee_id) DO NOTHING RETURNING *`,
    [badgeId, employeeId]
  );
  return rows[0] || null;
}

module.exports = { ...base, listWithEarned, earnedBadgeIds, award };
