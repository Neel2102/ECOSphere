// EcoSphere - Badge CRUD + badge gallery
// Owner: yagna
const badgeModel = require('../models/badgeModel');
const { makeCrudController } = require('../utils/crudFactory');

const crud = makeCrudController(badgeModel, 'Badge');

// Gallery view: every badge + whether the current user earned it.
async function list(req, res, next) {
  try {
    const items = await badgeModel.listWithEarned(req.user.id);
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list };
