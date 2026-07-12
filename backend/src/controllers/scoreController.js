// EcoSphere - Department + overall ESG score endpoints
// Owner: yagna
const { computeScores } = require('../utils/scoreCalculator');
const departmentScoreModel = require('../models/departmentScoreModel');

// Recomputes and returns current-period scores (idempotent upsert).
async function current(req, res, next) {
  try {
    const scores = await computeScores(req.query.period);
    res.json({ success: true, data: scores });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const rows = await departmentScoreModel.history({
      department_id: req.query.department_id,
      months: Math.min(24, parseInt(req.query.months, 10) || 12),
    });
    res.json({ success: true, data: { items: rows } });
  } catch (err) {
    next(err);
  }
}

module.exports = { current, history };
