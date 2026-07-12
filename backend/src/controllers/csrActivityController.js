// EcoSphere - CSR Activity CRUD
// Owner: kavya
const csrActivityModel = require('../models/csrActivityModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(csrActivityModel, 'CSR activity');

async function list(req, res, next) {
  try {
    const items = await csrActivityModel.listDetailed({
      q: req.query.q,
      status: req.query.status,
      category_id: req.query.category_id,
      forUserId: req.user.id,
      organizationId: req.organizationId,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await csrActivityModel.create({ ...req.body, created_by: req.user.id }, req.organizationId);
    res.status(201).json({ success: true, message: 'CSR activity created.', data: { item } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list, create };
