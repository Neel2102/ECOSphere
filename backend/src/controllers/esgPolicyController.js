// EcoSphere - ESG Policy CRUD
// Owner: kavya
const esgPolicyModel = require('../models/esgPolicyModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(esgPolicyModel, 'Policy');

async function list(req, res, next) {
  try {
    const items = await esgPolicyModel.listDetailed({
      q: req.query.q,
      status: req.query.status,
      organizationId: req.organizationId,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list };
