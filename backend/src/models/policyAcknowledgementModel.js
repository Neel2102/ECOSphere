// EcoSphere - Policy Acknowledgement data access
// Owner: kavya
const { query } = require('../config/db');

async function acknowledge(policyId, employeeId) {
  const { rows } = await query(
    `INSERT INTO policy_acknowledgements (policy_id, employee_id)
     VALUES ($1, $2)
     ON CONFLICT (policy_id, employee_id) DO UPDATE SET acknowledged_at = policy_acknowledgements.acknowledged_at
     RETURNING *`,
    [policyId, employeeId]
  );
  return rows[0];
}

// Full matrix: one row per (active policy, employee/manager) with status.
async function listStatus({ policy_id, pendingOnly, organizationId } = {}) {
  const params = [];
  const clauses = ["p.status = 'active'", "u.is_verified", "u.role IN ('employee', 'manager')"];
  if (policy_id) { params.push(policy_id); clauses.push(`p.id = $${params.length}`); }
  if (organizationId) { params.push(organizationId); clauses.push(`u.organization_id = $${params.length}`); clauses.push(`p.organization_id = $${params.length}`); }
  if (pendingOnly) clauses.push('pa.id IS NULL');
  const { rows } = await query(
    `SELECT p.id AS policy_id, p.title AS policy_title, u.id AS employee_id,
            u.full_name AS employee_name, u.department_id,
            pa.acknowledged_at, (pa.id IS NOT NULL) AS acknowledged
     FROM esg_policies p
     CROSS JOIN users u
     LEFT JOIN policy_acknowledgements pa ON pa.policy_id = p.id AND pa.employee_id = u.id
     WHERE ${clauses.join(' AND ')}
     ORDER BY p.id, u.full_name`,
    params
  );
  return rows;
}

// Acknowledgement rate per department (governance score input).
async function rateByDepartment(organizationId) {
  const { rows } = await query(
    `SELECT u.department_id,
            COUNT(pa.id)::int AS acknowledged,
            (COUNT(*) FILTER (WHERE TRUE))::int AS expected
     FROM esg_policies p
     CROSS JOIN users u
     LEFT JOIN policy_acknowledgements pa ON pa.policy_id = p.id AND pa.employee_id = u.id
     WHERE p.status = 'active' AND u.is_verified AND u.role IN ('employee', 'manager')
       AND u.department_id IS NOT NULL AND u.organization_id = $1 AND p.organization_id = $1
     GROUP BY u.department_id`,
    [organizationId]
  );
  return rows;
}

module.exports = { acknowledge, listStatus, rateByDepartment };
