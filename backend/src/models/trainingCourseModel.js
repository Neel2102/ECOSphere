// EcoSphere - Training Course data access
const { makeModel } = require('../utils/crudFactory');

const base = makeModel({
  table: 'training_courses',
  writable: ['title', 'description', 'duration_hours', 'category', 'status', 'organization_id'],
  order: 'title ASC, id DESC',
  search: ['title', 'category'],
});

module.exports = { ...base };
