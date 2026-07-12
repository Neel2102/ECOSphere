// EcoSphere - ESG configuration (weights, toggles) data access
// Owner: dhrumil
const { query } = require('../config/db');

const WRITABLE = [
  'weight_environmental', 'weight_social', 'weight_governance',
  'auto_emission_calculation', 'evidence_requirement', 'badge_auto_award',
  'notify_in_app', 'notify_email', 'notify_compliance', 'notify_approvals',
  'notify_policy_reminders', 'notify_badge_unlocks',
];

async function get(organizationId) {
  if (!organizationId) {
    const { rows } = await query('SELECT * FROM esg_settings ORDER BY id ASC LIMIT 1');
    return rows[0];
  }
  const { rows } = await query('SELECT * FROM esg_settings WHERE organization_id = $1', [organizationId]);
  if (rows.length === 0) {
    const { rows: newRow } = await query(
      `INSERT INTO esg_settings (organization_id) VALUES ($1) RETURNING *`,
      [organizationId]
    );
    return newRow[0];
  }
  return rows[0];
}

async function update(data, organizationId) {
  const entries = Object.entries(data).filter(
    ([key, val]) => WRITABLE.includes(key) && val !== undefined
  );
  if (entries.length === 0) return get(organizationId);
  const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
  
  let sql = `UPDATE esg_settings SET ${sets.join(', ')}, updated_at = NOW() WHERE`;
  const params = entries.map(([, val]) => val);
  
  if (organizationId) {
    sql += ` organization_id = $${params.length + 1}`;
    params.push(organizationId);
  } else {
    sql += ` id = 1`;
  }
  sql += ` RETURNING *`;
  
  const { rows } = await query(sql, params);
  return rows[0] || get(organizationId);
}

module.exports = { get, update, WRITABLE };
