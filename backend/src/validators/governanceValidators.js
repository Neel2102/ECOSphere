// EcoSphere - Governance module validation
// Owner: kavya
const { validate } = require('./validate');

const policy = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Policy title is required.');
  if (body.effective_date && Number.isNaN(Date.parse(body.effective_date))) {
    errors.push('effective_date must be a valid date.');
  }
  if (body.status && !['draft', 'active', 'archived'].includes(body.status)) errors.push('Invalid status.');
  return errors;
});

const audit = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Audit title is required.');
  if (body.audit_date && Number.isNaN(Date.parse(body.audit_date))) {
    errors.push('audit_date must be a valid date.');
  }
  if (body.status && !['planned', 'in_progress', 'under_review', 'completed'].includes(body.status)) {
    errors.push('Invalid status.');
  }
  return errors;
});

// Every compliance issue must have an owner and a due date (business rule).
const complianceIssue = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Issue title is required.');
  if (!['low', 'medium', 'high', 'critical'].includes(body.severity)) {
    errors.push('Severity must be low, medium, high or critical.');
  }
  if (!body.owner_id) errors.push('Every compliance issue must have an assigned owner.');
  if (!body.due_date || Number.isNaN(Date.parse(body.due_date))) {
    errors.push('Every compliance issue must have a valid due date.');
  }
  return errors;
});

const complianceIssueUpdate = validate((body) => {
  const errors = [];
  if (body.severity && !['low', 'medium', 'high', 'critical'].includes(body.severity)) {
    errors.push('Invalid severity.');
  }
  if (body.status && !['open', 'in_progress', 'resolved'].includes(body.status)) errors.push('Invalid status.');
  if ('owner_id' in body && !body.owner_id) errors.push('Owner cannot be removed - reassign instead.');
  if ('due_date' in body && (!body.due_date || Number.isNaN(Date.parse(body.due_date)))) {
    errors.push('Due date cannot be removed.');
  }
  return errors;
});

module.exports = { policy, audit, complianceIssue, complianceIssueUpdate };
