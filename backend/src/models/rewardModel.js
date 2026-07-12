// EcoSphere - Reward catalog data access
// Owner: yagna
const { query } = require('../config/db');
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'rewards',
  writable: ['name', 'description', 'points_required', 'stock', 'status'],
  order: 'points_required ASC',
  search: ['name'],
});

// Atomically decrement stock; returns the reward only if stock was available.
async function takeStock(id) {
  const { rows } = await query(
    `UPDATE rewards SET stock = stock - 1, updated_at = NOW()
     WHERE id = $1 AND stock > 0 AND status = 'active'
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function restoreStock(id) {
  await query('UPDATE rewards SET stock = stock + 1, updated_at = NOW() WHERE id = $1', [id]);
}

module.exports = { ...base, takeStock, restoreStock };
