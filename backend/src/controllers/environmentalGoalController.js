// EcoSphere - Environmental Goal CRUD + progress
// Owner: neel
const environmentalGoalModel = require('../models/environmentalGoalModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(environmentalGoalModel, 'Environmental goal');

async function list(req, res, next) {
  try {
    const items = await environmentalGoalModel.listDetailed({
      q: req.query.q,
      department_id: req.query.department_id,
      status: req.query.status,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list };
