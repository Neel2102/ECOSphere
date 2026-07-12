// EcoSphere - Department Score aggregation data access
// Owner: yagna
const { query } = require('../config/db');

async function upsert({ departmentId, period, environmental, social, governance, total }) {
  const { rows } = await query(
    `INSERT INTO department_scores
       (department_id, period, environmental_score, social_score, governance_score, total_score, calculated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (department_id, period) DO UPDATE SET
       environmental_score = EXCLUDED.environmental_score,
       social_score = EXCLUDED.social_score,
       governance_score = EXCLUDED.governance_score,
       total_score = EXCLUDED.total_score,
       calculated_at = NOW()
     RETURNING *`,
    [departmentId, period, environmental, social, governance, total]
  );
  return rows[0];
}

async function listForPeriod(period) {
  const { rows } = await query(
    `SELECT s.*, d.name AS department_name, d.code AS department_code
     FROM department_scores s
     JOIN departments d ON d.id = s.department_id
     WHERE s.period = $1
     ORDER BY s.total_score DESC`,
    [period]
  );
  return rows;
}

// Score history across periods (trend charts / reports).
async function history({ department_id, months = 12 } = {}) {
  const params = [months];
  let extra = '';
  if (department_id) { params.push(department_id); extra = ' AND s.department_id = $2'; }
  const { rows } = await query(
    `SELECT s.*, d.name AS department_name
     FROM department_scores s
     JOIN departments d ON d.id = s.department_id
     WHERE TO_DATE(s.period || '-01', 'YYYY-MM-DD')
           >= date_trunc('month', CURRENT_DATE) - ($1 - 1) * INTERVAL '1 month'${extra}
     ORDER BY s.period ASC, s.total_score DESC`,
    params
  );
  return rows;
}

module.exports = { upsert, listForPeriod, history };
