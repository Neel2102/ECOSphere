// EcoSphere - Reward Redemption data access
// Owner: yagna
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'reward_redemptions',
  writable: ['reward_id', 'employee_id', 'points_spent', 'status'],
  order: 'id DESC',
});

async function listDetailed({ employee_id, organizationId } = {}) {
  const params = [];
  const clauses = [];
  if (employee_id) { params.push(employee_id); clauses.push(`r.employee_id = $${params.length}`); }
  if (organizationId) { params.push(organizationId); clauses.push(`u.organization_id = $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT r.*, rw.name AS reward_name, u.full_name AS employee_name
     FROM reward_redemptions r
     JOIN rewards rw ON rw.id = r.reward_id
     JOIN users u ON u.id = r.employee_id
     ${where}
     ORDER BY r.id DESC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
