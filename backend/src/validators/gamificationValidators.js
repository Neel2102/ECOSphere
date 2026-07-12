// EcoSphere - Gamification module validation
// Owner: yagna
const { validate } = require('./validate');

const challenge = validate((body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Challenge title is required.');
  if (body.xp !== undefined && (!Number.isInteger(Number(body.xp)) || Number(body.xp) < 0)) {
    errors.push('XP must be a non-negative integer.');
  }
  if (body.difficulty && !['easy', 'medium', 'hard'].includes(body.difficulty)) {
    errors.push('Difficulty must be easy, medium or hard.');
  }
  if (body.deadline && Number.isNaN(Date.parse(body.deadline))) errors.push('Invalid deadline date.');
  if (body.status && !['draft', 'active', 'under_review', 'completed', 'archived'].includes(body.status)) {
    errors.push('Invalid challenge status.');
  }
  return errors;
});

const progressUpdate = validate((body) => {
  const errors = [];
  const progress = Number(body.progress);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    errors.push('Progress must be an integer between 0 and 100.');
  }
  return errors;
});

const badge = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Badge name is required.');
  if (!['xp', 'challenges_completed'].includes(body.unlock_rule_type)) {
    errors.push('unlock_rule_type must be xp or challenges_completed.');
  }
  if (!Number.isInteger(Number(body.unlock_rule_value)) || Number(body.unlock_rule_value) <= 0) {
    errors.push('unlock_rule_value must be a positive integer.');
  }
  return errors;
});

const reward = validate((body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Reward name is required.');
  if (!Number.isInteger(Number(body.points_required)) || Number(body.points_required) <= 0) {
    errors.push('points_required must be a positive integer.');
  }
  if (body.stock !== undefined && (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)) {
    errors.push('Stock must be a non-negative integer.');
  }
  return errors;
});

module.exports = { challenge, progressUpdate, badge, reward };
