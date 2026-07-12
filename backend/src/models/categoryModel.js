// EcoSphere - Category master (CSR Activity / Challenge types)
// Owner: dhrumil
const { makeModel } = require('../utils/crudFactory');

module.exports = makeModel({
  table: 'categories',
  writable: ['name', 'type', 'status', 'organization_id'],
  order: 'type ASC, name ASC',
  search: ['name'],
});
