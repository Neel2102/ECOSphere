// EcoSphere - Product ESG Profile CRUD
// Owner: neel
const productEsgProfileModel = require('../models/productEsgProfileModel');
const { makeCrudController } = require('../utils/crudFactory');

module.exports = makeCrudController(productEsgProfileModel, 'Product ESG profile', {
  filters: (req) => ({
    where: { esg_rating: req.query.esg_rating, status: req.query.status },
    q: req.query.q,
  }),
});
