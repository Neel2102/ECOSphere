// EcoSphere - Emission Factor master data access
// Owner: neel
const { makeModel } = require('../utils/crudFactory');

module.exports = makeModel({
  table: 'emission_factors',
  writable: ['name', 'source_type', 'unit', 'factor_value', 'status'],
  order: 'source_type ASC, name ASC',
  search: ['name', 'unit'],
});
