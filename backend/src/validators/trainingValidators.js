// EcoSphere - Training module validation
const { validate } = require('./validate');

const course = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) {
    errors.push('Course title is required and must be at least 3 characters.');
  }
  if (body.duration_hours !== undefined && body.duration_hours !== null) {
    const val = Number(body.duration_hours);
    if (Number.isNaN(val) || val < 0) {
      errors.push('Duration hours must be a non-negative number.');
    }
  }
  return errors;
});

const record = validate((body) => {
  const errors = [];
  if (!body.course_id) errors.push('Course ID is required.');
  if (!body.employee_id) errors.push('Employee ID is required.');
  if (body.score !== undefined && body.score !== null) {
    const val = Number(body.score);
    if (!Number.isInteger(val) || val < 0 || val > 100) {
      errors.push('Score must be an integer between 0 and 100.');
    }
  }
  if (body.completion_date && Number.isNaN(Date.parse(body.completion_date))) {
    errors.push('Completion date must be a valid date.');
  }
  return errors;
});

module.exports = { course, record };
