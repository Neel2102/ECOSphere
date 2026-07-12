// EcoSphere - Governance Audit data access
// Owner: kavya
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'audits',
  writable: ['title', 'department_id', 'auditor_name', 'audit_date', 'findings', 'status', 'organization_id'],
  order: 'audit_date DESC NULLS LAST, id DESC',
  search: ['title', 'auditor_name'],
});

// Audit table view with department + open issue counts.
async function listDetailed({ q, status, department_id, organizationId } = {}) {
  const params = [];
  const clauses = [];
  if (status) { params.push(status); clauses.push(`a.status = $${params.length}`); }
  if (department_id) { params.push(department_id); clauses.push(`a.department_id = $${params.length}`); }
  if (organizationId) { params.push(organizationId); clauses.push(`a.organization_id = $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`(a.title ILIKE $${params.length} OR a.auditor_name ILIKE $${params.length})`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT a.*, d.name AS department_name,
            (SELECT COUNT(*) FROM compliance_issues ci WHERE ci.audit_id = a.id)::int AS issue_count,
            (SELECT COUNT(*) FROM compliance_issues ci
             WHERE ci.audit_id = a.id AND ci.status != 'resolved')::int AS open_issue_count
     FROM audits a
     LEFT JOIN departments d ON d.id = a.department_id
     ${where}
     ORDER BY a.audit_date DESC NULLS LAST, a.id DESC`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed };
