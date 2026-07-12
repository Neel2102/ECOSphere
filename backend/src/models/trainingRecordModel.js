// EcoSphere - Training Record / Completion data access
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'training_records',
  writable: ['course_id', 'employee_id', 'completion_date', 'score', 'status', 'organization_id'],
  order: 'completion_date DESC, id DESC',
});

// Detailed list linking users and courses
async function listDetailed({ q, employee_id, department_id, course_id, organizationId } = {}) {
  const clauses = [];
  const params = [];
  
  if (employee_id) {
    params.push(employee_id);
    clauses.push(`tr.employee_id = $${params.length}`);
  }
  if (course_id) {
    params.push(course_id);
    clauses.push(`tr.course_id = $${params.length}`);
  }
  if (department_id) {
    params.push(department_id);
    clauses.push(`u.department_id = $${params.length}`);
  }
  if (organizationId) {
    params.push(organizationId);
    clauses.push(`u.organization_id = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(u.full_name ILIKE $${params.length} OR tc.title ILIKE $${params.length})`);
  }
  
  const whereSql = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  
  const { rows } = await query(
    `SELECT tr.*, 
            u.full_name AS employee_name,
            d.name AS department_name,
            tc.title AS course_title,
            tc.duration_hours AS course_duration_hours,
            tc.category AS course_category
     FROM training_records tr
     JOIN users u ON u.id = tr.employee_id
     LEFT JOIN departments d ON d.id = u.department_id
     JOIN training_courses tc ON tc.id = tr.course_id
     ${whereSql}
     ORDER BY tr.completion_date DESC, tr.id DESC`,
    params
  );
  return rows;
}

// Completion stats for analytics card
async function getStats(organizationId) {
  const { rows } = await query(
    `SELECT 
       COUNT(DISTINCT tr.employee_id)::int AS unique_employees_completed,
       COUNT(*)::int AS total_completions,
       ROUND(COALESCE(AVG(tr.score), 0)::numeric, 1)::float AS average_score,
       ROUND(COALESCE(SUM(tc.duration_hours), 0)::numeric, 1)::float AS total_training_hours
     FROM training_records tr
     JOIN training_courses tc ON tc.id = tr.course_id
     WHERE tr.status = 'completed' AND tr.organization_id = $1`,
    [organizationId]
  );
  return rows[0];
}

module.exports = { ...base, listDetailed, getStats };
