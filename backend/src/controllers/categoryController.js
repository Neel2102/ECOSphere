// EcoSphere - Category CRUD
// Owner: dhrumil
const categoryModel = require('../models/categoryModel');
const { makeCrudController } = require('../utils/crudFactory');

module.exports = makeCrudController(categoryModel, 'Category', {
  filters: (req) => ({ where: { type: req.query.type, status: req.query.status }, q: req.query.q }),
});
