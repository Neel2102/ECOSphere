// EcoSphere - Environmental module validation
// Owner: neel
const { validate } = require('./validate');

const isPositiveNumber = (value) => value !== undefined && !Number.isNaN(Number(value)) && Number(value) >= 0;

const emissionFactor = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Factor name is required.');
  if (!['purchase', 'manufacturing', 'fleet', 'expense'].includes(body.source_type)) {
    errors.push('source_type must be purchase, manufacturing, fleet or expense.');
  }
  if (!body.unit) errors.push('Unit is required (e.g. litre, kWh, km).');
  if (!isPositiveNumber(body.factor_value)) errors.push('factor_value must be a number >= 0.');
  return errors;
});

const productProfile = validate((body) => {
  const errors = [];
  if (!body.product_name || String(body.product_name).trim().length < 2) errors.push('Product name is required.');
  if (body.carbon_per_unit !== undefined && !isPositiveNumber(body.carbon_per_unit)) {
    errors.push('carbon_per_unit must be a number >= 0.');
  }
  if (body.esg_rating && !['A', 'B', 'C', 'D', 'E'].includes(body.esg_rating)) {
    errors.push('esg_rating must be A-E.');
  }
  return errors;
});

const goal = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Goal name is required.');
  if (!isPositiveNumber(body.target_co2)) errors.push('target_co2 must be a number >= 0.');
  if (body.current_co2 !== undefined && !isPositiveNumber(body.current_co2)) {
    errors.push('current_co2 must be a number >= 0.');
  }
  if (!body.deadline || Number.isNaN(Date.parse(body.deadline))) errors.push('A valid deadline date is required.');
  if (body.status && !['active', 'on_track', 'completed', 'missed'].includes(body.status)) {
    errors.push('Invalid goal status.');
  }
  return errors;
});

const carbonTransaction = validate((body) => {
  const errors = [];
  if (!['purchase', 'manufacturing', 'fleet', 'expense', 'manual'].includes(body.source_type)) {
    errors.push('source_type must be purchase, manufacturing, fleet, expense or manual.');
  }
  if (!isPositiveNumber(body.quantity)) errors.push('quantity must be a number >= 0.');
  if (body.transaction_date && Number.isNaN(Date.parse(body.transaction_date))) {
    errors.push('transaction_date must be a valid date.');
  }
  return errors;
});

module.exports = { emissionFactor, productProfile, goal, carbonTransaction };
