// EcoSphere - Product ESG Profile master data access
// Owner: neel
const { makeModel } = require('../utils/crudFactory');

module.exports = makeModel({
  table: 'product_esg_profiles',
  writable: ['product_name', 'sku', 'carbon_per_unit', 'recyclable', 'esg_rating', 'notes', 'status', 'organization_id'],
  order: 'product_name ASC',
  search: ['product_name', 'sku'],
});
