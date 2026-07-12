// EcoSphere - Department CRUD
// Owner: dhrumil
const departmentModel = require('../models/departmentModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(departmentModel, 'Department');

// List view needs head/parent names + live member counts.
async function list(req, res, next) {
  try {
    const items = await departmentModel.listDetailed({ q: req.query.q, status: req.query.status, organizationId: req.organizationId });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list };
