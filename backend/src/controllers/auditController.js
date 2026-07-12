// EcoSphere - Audit CRUD
// Owner: kavya
const auditModel = require('../models/auditModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(auditModel, 'Audit');

async function list(req, res, next) {
  try {
    const items = await auditModel.listDetailed({
      q: req.query.q,
      status: req.query.status,
      department_id: req.query.department_id,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list };
