// EcoSphere - Compliance Issue data access
// Owner: kavya
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'compliance_issues',
  writable: [
    'title', 'description', 'audit_id', 'severity', 'department_id',
    'owner_id', 'due_date', 'status', 'resolved_at',
  ],
  order: 'due_date ASC',
  search: ['title'],
});

async function listDetailed({ q, status, severity, department_id, owner_id } = {}) {
  const params = [];
  const clauses = [];
  if (status) { params.push(status); clauses.push(`i.status = $${params.length}`); }
  if (severity) { params.push(severity); clauses.push(`i.severity = $${params.length}`); }
  if (department_id) { params.push(department_id); clauses.push(`i.department_id = $${params.length}`); }
  if (owner_id) { params.push(owner_id); clauses.push(`i.owner_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`i.title ILIKE $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT i.*, d.name AS department_name, u.full_name AS owner_name, a.title AS audit_title,
            (i.status != 'resolved' AND i.due_date < CURRENT_DATE) AS overdue
     FROM compliance_issues i
     LEFT JOIN departments d ON d.id = i.department_id
     LEFT JOIN users u ON u.id = i.owner_id
     LEFT JOIN audits a ON a.id = i.audit_id
     ${where}
     ORDER BY i.due_date ASC`,
    params
  );
  return rows;
}

// Open issues past due date that have not been flagged yet (notification feed).
async function findNewlyOverdue() {
  const { rows } = await query(
    `SELECT i.*, u.full_name AS owner_name
     FROM compliance_issues i
     JOIN users u ON u.id = i.owner_id
     WHERE i.status != 'resolved' AND i.due_date < CURRENT_DATE AND i.overdue_notified = FALSE`
  );
  return rows;
}

async function markOverdueNotified(ids) {
  if (ids.length === 0) return;
  await query('UPDATE compliance_issues SET overdue_notified = TRUE WHERE id = ANY($1::int[])', [ids]);
}

// Open issue counts by severity per department (governance score input).
async function openBySeverityPerDepartment() {
  const { rows } = await query(
    `SELECT department_id, severity, COUNT(*)::int AS count
     FROM compliance_issues
     WHERE status != 'resolved' AND department_id IS NOT NULL
     GROUP BY department_id, severity`
  );
  return rows;
}

module.exports = { ...base, listDetailed, findNewlyOverdue, markOverdueNotified, openBySeverityPerDepartment };
