// EcoSphere - In-app notification data access
// Owner: dhrumil
const { query } = require('../config/db');

async function create({ userId, type, title, message, link }) {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, message || null, link || null]
  );
  return rows[0];
}

async function listForUser(userId, { unreadOnly = false, limit = 50 } = {}) {
  const { rows } = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1 ${unreadOnly ? 'AND is_read = FALSE' : ''}
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function unreadCount(userId) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
  return rows[0].count;
}

async function markRead(id, userId) {
  const { rowCount } = await query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rowCount > 0;
}

async function markAllRead(userId) {
  await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
}

module.exports = { create, listForUser, unreadCount, markRead, markAllRead };
