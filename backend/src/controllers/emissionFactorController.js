// EcoSphere - Emission Factor CRUD
// Owner: neel
const emissionFactorModel = require('../models/emissionFactorModel');
const { makeCrudController } = require('../utils/crudFactory');

module.exports = makeCrudController(emissionFactorModel, 'Emission factor', {
  filters: (req) => ({
    where: { source_type: req.query.source_type, status: req.query.status },
    q: req.query.q,
  }),
});
