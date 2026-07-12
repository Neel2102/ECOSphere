// EcoSphere - Generic model + controller factories for standard CRUD entities.
// Owner: dhrumil | Domain-specific queries live in each entity's own file.
const { query } = require('../config/db');
const ApiError = require('./apiError');

/*
 * makeModel({ table, writable, order, search, touch })
 *  - writable: columns accepted from clients on create/update
 *  - search:   columns matched by the ?q= filter (ILIKE)
 *  - touch:    set updated_at on update (default true)
 */
function makeModel({ table, writable, order = 'id DESC', search = [], touch = true }) {
  return {
    table,

    async list({ where = {}, q } = {}) {
      const clauses = [];
      const params = [];
      for (const [col, val] of Object.entries(where)) {
        if (val === undefined || val === null || val === '') continue;
        params.push(val);
        clauses.push(`${col} = $${params.length}`);
      }
      if (q && search.length > 0) {
        params.push(`%${q}%`);
        clauses.push(`(${search.map((col) => `${col} ILIKE $${params.length}`).join(' OR ')})`);
      }
      const whereSql = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
      const { rows } = await query(`SELECT * FROM ${table}${whereSql} ORDER BY ${order}`, params);
      return rows;
    },

    async findById(id) {
      const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      return rows[0] || null;
    },

    async create(data) {
      const entries = Object.entries(data).filter(
        ([key, val]) => writable.includes(key) && val !== undefined
      );
      if (entries.length === 0) throw new ApiError(400, 'No valid fields provided.');
      const cols = entries.map(([key]) => key);
      const vals = entries.map(([, val]) => val);
      const placeholders = vals.map((val, index) => `$${index + 1}`);
      const { rows } = await query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
        vals
      );
      return rows[0];
    },

    async update(id, data) {
      const entries = Object.entries(data).filter(
        ([key, val]) => writable.includes(key) && val !== undefined
      );
      if (entries.length === 0) return this.findById(id);
      const sets = entries.map(([key], index) => `${key} = $${index + 2}`);
      if (touch) sets.push('updated_at = NOW()');
      const { rows } = await query(
        `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
        [id, ...entries.map(([, val]) => val)]
      );
      return rows[0] || null;
    },

    async remove(id) {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return rowCount > 0;
    },
  };
}

/*
 * makeCrudController(model, name, { filters })
 *  - name:    singular resource name for messages ("Department")
 *  - filters: (req) => ({ where, q }) mapping of query params for list()
 */
function makeCrudController(model, name, { filters } = {}) {
  return {
    list: async (req, res, next) => {
      try {
        const rows = await model.list(filters ? filters(req) : { q: req.query.q });
        res.json({ success: true, data: { items: rows } });
      } catch (err) {
        next(err);
      }
    },

    get: async (req, res, next) => {
      try {
        const row = await model.findById(req.params.id);
        if (!row) throw new ApiError(404, `${name} not found.`);
        res.json({ success: true, data: { item: row } });
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const row = await model.create(req.body);
        res.status(201).json({ success: true, message: `${name} created.`, data: { item: row } });
      } catch (err) {
        next(err);
      }
    },

    update: async (req, res, next) => {
      try {
        const row = await model.update(req.params.id, req.body);
        if (!row) throw new ApiError(404, `${name} not found.`);
        res.json({ success: true, message: `${name} updated.`, data: { item: row } });
      } catch (err) {
        next(err);
      }
    },

    remove: async (req, res, next) => {
      try {
        const removed = await model.remove(req.params.id);
        if (!removed) throw new ApiError(404, `${name} not found.`);
        res.json({ success: true, message: `${name} deleted.` });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { makeModel, makeCrudController };
