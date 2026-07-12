// EcoSphere - Environmental Goal master data access
// Owner: neel
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'environmental_goals',
  writable: ['name', 'department_id', 'target_co2', 'current_co2', 'deadline', 'status', 'organization_id'],
  order: 'deadline ASC',
  search: ['name'],
});

// Goals with department name + progress % (100 = at/below target).
async function listDetailed({ q, department_id, status, organizationId } = {}) {
  const params = [];
  const clauses = [];
  if (department_id) { params.push(department_id); clauses.push(`g.department_id = $${params.length}`); }
  if (status) { params.push(status); clauses.push(`g.status = $${params.length}`); }
  if (organizationId) { params.push(organizationId); clauses.push(`g.organization_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`g.name ILIKE $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT g.*, d.name AS department_name,
            CASE WHEN g.current_co2 <= 0 THEN 100
                 ELSE LEAST(100, ROUND(g.target_co2 / g.current_co2 * 100))
            END::int AS progress
     FROM environmental_goals g
     LEFT JOIN departments d ON d.id = g.department_id
     ${where}
     ORDER BY g.deadline ASC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
