// EcoSphere - ESG configuration (weights, toggles) data access
// Owner: dhrumil
const { query } = require('../config/db');

const WRITABLE = [
  'weight_environmental', 'weight_social', 'weight_governance',
  'auto_emission_calculation', 'evidence_requirement', 'badge_auto_award',
  'notify_in_app', 'notify_email', 'notify_compliance', 'notify_approvals',
  'notify_policy_reminders', 'notify_badge_unlocks',
];

async function get() {
  const { rows } = await query('SELECT * FROM esg_settings WHERE id = 1');
  return rows[0];
}

async function update(data) {
  const entries = Object.entries(data).filter(
    ([key, val]) => WRITABLE.includes(key) && val !== undefined
  );
  if (entries.length === 0) return get();
  const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
  const { rows } = await query(
    `UPDATE esg_settings SET ${sets.join(', ')}, updated_at = NOW() WHERE id = 1 RETURNING *`,
    entries.map(([, val]) => val)
  );
  return rows[0];
}

module.exports = { get, update, WRITABLE };
