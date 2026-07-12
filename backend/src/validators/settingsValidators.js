// EcoSphere - Department / category / ESG-config validation
// Owner: dhrumil
const { validate } = require('./validate');

const department = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Department name is required.');
  if (!body.code || !/^[A-Za-z0-9-]{2,20}$/.test(body.code)) {
    errors.push('Code must be 2-20 letters/numbers (e.g. MFG).');
  }
  if (body.status && !['active', 'inactive'].includes(body.status)) errors.push('Invalid status.');
  return errors;
});

const departmentUpdate = validate((body) => {
  const errors = [];
  if (body.name !== undefined && String(body.name).trim().length < 2) errors.push('Department name is too short.');
  if (body.code !== undefined && !/^[A-Za-z0-9-]{2,20}$/.test(body.code)) errors.push('Invalid department code.');
  if (body.status && !['active', 'inactive'].includes(body.status)) errors.push('Invalid status.');
  return errors;
});

const category = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Category name is required.');
  if (!['csr_activity', 'challenge'].includes(body.type)) {
    errors.push('Type must be csr_activity or challenge.');
  }
  return errors;
});

const esgConfig = validate((body) => {
  const errors = [];
  const weights = ['weight_environmental', 'weight_social', 'weight_governance'];
  for (const key of weights) {
    if (body[key] !== undefined && (!Number.isInteger(body[key]) || body[key] < 0 || body[key] > 100)) {
      errors.push(`${key} must be an integer between 0 and 100.`);
    }
  }
  const provided = weights.filter((key) => body[key] !== undefined);
  if (provided.length === 3) {
    const sum = weights.reduce((total, key) => total + body[key], 0);
    if (sum !== 100) errors.push('The three weights must add up to 100.');
  } else if (provided.length > 0) {
    errors.push('Send all three weights together so they can be validated as a set.');
  }
  return errors;
});

module.exports = { department, departmentUpdate, category, esgConfig };
