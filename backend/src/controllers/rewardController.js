// EcoSphere - Reward catalog CRUD
// Owner: yagna
const rewardModel = require('../models/rewardModel');
const { makeCrudController } = require('../utils/crudFactory');

module.exports = makeCrudController(rewardModel, 'Reward', {
  filters: (req) => ({ where: { status: req.query.status }, q: req.query.q }),
});
