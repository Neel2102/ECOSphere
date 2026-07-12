// EcoSphere - Challenge data access (lifecycle statuses)
// Owner: yagna
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'challenges',
  writable: [
    'title', 'category_id', 'description', 'xp', 'difficulty',
    'evidence_required', 'deadline', 'status', 'created_by',
  ],
  order: 'id DESC',
  search: ['title'],
});

// Challenge cards with category + participant counts + my membership.
async function listDetailed({ q, status, category_id, forUserId } = {}) {
  const params = [];
  const clauses = [];
  if (status) { params.push(status); clauses.push(`ch.status = $${params.length}`); }
  if (category_id) { params.push(category_id); clauses.push(`ch.category_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`ch.title ILIKE $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  params.push(forUserId || 0);
  const { rows } = await query(
    `SELECT ch.*, c.name AS category_name,
            (SELECT COUNT(*) FROM challenge_participations cp WHERE cp.challenge_id = ch.id)::int AS participant_count,
            EXISTS (SELECT 1 FROM challenge_participations cp
                    WHERE cp.challenge_id = ch.id AND cp.employee_id = $${params.length}) AS joined_by_me
     FROM challenges ch
     LEFT JOIN categories c ON c.id = ch.category_id
     ${where}
     ORDER BY ch.id DESC`,
    params
  );
  return rows;
}

async function countsByStatus() {
  const { rows } = await query(
    'SELECT status, COUNT(*)::int AS count FROM challenges GROUP BY status'
  );
  return rows;
}

module.exports = { ...base, listDetailed, countsByStatus };
