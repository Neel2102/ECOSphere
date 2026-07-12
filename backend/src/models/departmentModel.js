// EcoSphere - Department master data access
// Owner: dhrumil
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'departments',
  writable: ['name', 'code', 'description', 'head_id', 'parent_department_id', 'employee_count', 'status', 'organization_id'],
  order: 'name ASC',
  search: ['name', 'code'],
});

// List with head/parent names resolved for the settings table view.
async function listDetailed({ q, status, organizationId } = {}) {
  const params = [];
  const clauses = [];
  if (status) {
    params.push(status);
    clauses.push(`d.status = $${params.length}`);
  }
  if (organizationId) {
    params.push(organizationId);
    clauses.push(`d.organization_id = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(d.name ILIKE $${params.length} OR d.code ILIKE $${params.length})`);
  }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT d.*, h.full_name AS head_name, p.name AS parent_department_name,
            (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id)::int AS member_count
     FROM departments d
     LEFT JOIN users h ON h.id = d.head_id
     LEFT JOIN departments p ON p.id = d.parent_department_id
     ${where}
     ORDER BY d.name ASC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
