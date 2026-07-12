// EcoSphere - ESG Policy master data access
// Owner: kavya
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'esg_policies',
  writable: ['title', 'description', 'version', 'effective_date', 'status'],
  order: 'created_at DESC',
  search: ['title'],
});

// Policies with acknowledgement progress (acked / verified employees).
async function listDetailed({ q, status } = {}) {
  const params = [];
  const clauses = [];
  if (status) { params.push(status); clauses.push(`p.status = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`p.title ILIKE $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.*,
            (SELECT COUNT(*) FROM policy_acknowledgements pa WHERE pa.policy_id = p.id)::int AS acknowledged_count,
            (SELECT COUNT(*) FROM users u WHERE u.is_verified AND u.role IN ('employee', 'manager'))::int AS employee_total
     FROM esg_policies p
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
