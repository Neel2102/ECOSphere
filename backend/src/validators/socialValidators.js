// EcoSphere - Social module validation
// Owner: kavya
const { validate } = require('./validate');

const activity = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Activity title is required.');
  if (body.points !== undefined && (!Number.isInteger(Number(body.points)) || Number(body.points) < 0)) {
    errors.push('Points must be a non-negative integer.');
  }
  if (body.activity_date && Number.isNaN(Date.parse(body.activity_date))) {
    errors.push('activity_date must be a valid date.');
  }
  if (body.status && !['open', 'closed'].includes(body.status)) errors.push('Invalid status.');
  return errors;
});

const approvalDecision = validate((body) => {
  const errors = [];
  if (body.points_earned !== undefined &&
      (!Number.isInteger(Number(body.points_earned)) || Number(body.points_earned) < 0)) {
    errors.push('points_earned must be a non-negative integer.');
  }
  return errors;
});

module.exports = { activity, approvalDecision };
