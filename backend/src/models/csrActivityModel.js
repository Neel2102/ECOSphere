// EcoSphere - CSR Activity data access
// Owner: kavya
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'csr_activities',
  writable: [
    'title', 'category_id', 'description', 'activity_date', 'location',
    'points', 'evidence_required', 'status', 'created_by', 'organization_id',
  ],
  order: 'activity_date DESC NULLS LAST, id DESC',
  search: ['title', 'location'],
});

// Activity cards: category name + joined count + whether a user has joined.
async function listDetailed({ q, status, category_id, forUserId, organizationId } = {}) {
  const params = [];
  const clauses = [];
  if (status) { params.push(status); clauses.push(`a.status = $${params.length}`); }
  if (category_id) { params.push(category_id); clauses.push(`a.category_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`(a.title ILIKE $${params.length} OR a.location ILIKE $${params.length})`); }
  if (organizationId) { params.push(organizationId); clauses.push(`a.organization_id = $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  params.push(forUserId || 0);
  const { rows } = await query(
    `SELECT a.*, c.name AS category_name,
            (SELECT COUNT(*) FROM employee_participations ep WHERE ep.activity_id = a.id)::int AS joined_count,
            EXISTS (SELECT 1 FROM employee_participations ep
                    WHERE ep.activity_id = a.id AND ep.employee_id = $${params.length}) AS joined_by_me
     FROM csr_activities a
     LEFT JOIN categories c ON c.id = a.category_id
     ${where}
     ORDER BY a.activity_date DESC NULLS LAST, a.id DESC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
