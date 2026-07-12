// EcoSphere - Employee Participation (CSR) data access
// Owner: kavya
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'employee_participations',
  writable: [
    'activity_id', 'employee_id', 'proof_path', 'approval_status',
    'points_earned', 'completion_date',
  ],
  order: 'id DESC',
});

async function findByActivityAndEmployee(activityId, employeeId) {
  const { rows } = await query(
    'SELECT * FROM employee_participations WHERE activity_id = $1 AND employee_id = $2',
    [activityId, employeeId]
  );
  return rows[0] || null;
}

// Approval queue with employee + activity context.
async function listDetailed({ approval_status, employee_id, activity_id } = {}) {
  const params = [];
  const clauses = [];
  if (approval_status) { params.push(approval_status); clauses.push(`p.approval_status = $${params.length}`); }
  if (employee_id) { params.push(employee_id); clauses.push(`p.employee_id = $${params.length}`); }
  if (activity_id) { params.push(activity_id); clauses.push(`p.activity_id = $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT p.*, u.full_name AS employee_name, u.department_id,
            a.title AS activity_title, a.points AS activity_points, a.evidence_required
     FROM employee_participations p
     JOIN users u ON u.id = p.employee_id
     JOIN csr_activities a ON a.id = p.activity_id
     ${where}
     ORDER BY p.id DESC`,
    params
  );
  return rows;
}

// Distinct participating employees per department (social score input).
async function participationByDepartment(organizationId) {
  const { rows } = await query(
    `SELECT u.department_id, COUNT(DISTINCT p.employee_id)::int AS participants
     FROM employee_participations p
     JOIN users u ON u.id = p.employee_id
     WHERE p.approval_status = 'approved' AND u.department_id IS NOT NULL AND u.organization_id = $1
     GROUP BY u.department_id`,
    [organizationId]
  );
  return rows;
}

module.exports = { ...base, findByActivityAndEmployee, listDetailed, participationByDepartment };
