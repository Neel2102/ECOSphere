// EcoSphere - Carbon Transaction data access
// Owner: neel
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'carbon_transactions',
  writable: [
    'source_type', 'reference', 'emission_factor_id', 'department_id',
    'quantity', 'unit', 'co2_amount', 'transaction_date', 'auto_calculated', 'created_by',
  ],
  order: 'transaction_date DESC, id DESC',
  search: ['reference'],
});

async function listDetailed({ q, department_id, source_type, from, to } = {}) {
  const params = [];
  const clauses = [];
  if (department_id) { params.push(department_id); clauses.push(`t.department_id = $${params.length}`); }
  if (source_type) { params.push(source_type); clauses.push(`t.source_type = $${params.length}`); }
  if (from) { params.push(from); clauses.push(`t.transaction_date >= $${params.length}`); }
  if (to) { params.push(to); clauses.push(`t.transaction_date <= $${params.length}`); }
  if (q) { params.push(`%${q}%`); clauses.push(`t.reference ILIKE $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT t.*, f.name AS factor_name, f.unit AS factor_unit, d.name AS department_name
     FROM carbon_transactions t
     LEFT JOIN emission_factors f ON f.id = t.emission_factor_id
     LEFT JOIN departments d ON d.id = t.department_id
     ${where}
     ORDER BY t.transaction_date DESC, t.id DESC`,
    params
  );
  return rows;
}

// Monthly CO2 totals for the last N months (dashboard trend line).
async function monthlyTotals(months = 12) {
  const { rows } = await query(
    `SELECT TO_CHAR(transaction_date, 'YYYY-MM') AS month,
            ROUND(SUM(co2_amount)::numeric, 2) AS total_co2
     FROM carbon_transactions
     WHERE transaction_date >= date_trunc('month', CURRENT_DATE) - ($1 - 1) * INTERVAL '1 month'
     GROUP BY 1 ORDER BY 1`,
    [months]
  );
  return rows;
}

// Per-department CO2 totals (used by score engine + reports).
async function totalsByDepartment({ from, to } = {}) {
  const params = [];
  const clauses = [];
  if (from) { params.push(from); clauses.push(`transaction_date >= $${params.length}`); }
  if (to) { params.push(to); clauses.push(`transaction_date <= $${params.length}`); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT department_id, ROUND(SUM(co2_amount)::numeric, 2) AS total_co2, COUNT(*)::int AS tx_count
     FROM carbon_transactions ${where} GROUP BY department_id`,
    params
  );
  return rows;
}

module.exports = { ...base, listDetailed, monthlyTotals, totalsByDepartment };
