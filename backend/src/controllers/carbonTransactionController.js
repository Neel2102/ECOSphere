// EcoSphere - Carbon Transaction CRUD + auto emission calculation
// Owner: neel
const carbonTransactionModel = require('../models/carbonTransactionModel');
const { resolveCo2 } = require('../utils/emissionCalculator');
const ApiError = require('../utils/apiError');

async function list(req, res, next) {
  try {
    const items = await carbonTransactionModel.listDetailed({
      q: req.query.q,
      department_id: req.query.department_id,
      source_type: req.query.source_type,
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

// CO2 comes from the emission calculator: quantity x factor when the
// auto-calculation toggle is on, manual co2_amount only when it is off.
async function create(req, res, next) {
  try {
    const { co2Amount, unit, autoCalculated } = await resolveCo2({
      emissionFactorId: req.body.emission_factor_id,
      quantity: req.body.quantity,
      manualCo2: req.body.co2_amount,
    });
    const item = await carbonTransactionModel.create({
      ...req.body,
      unit: req.body.unit || unit,
      co2_amount: co2Amount,
      auto_calculated: autoCalculated,
      created_by: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Carbon transaction recorded.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await carbonTransactionModel.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Carbon transaction not found.');

    let patch = { ...req.body };
    // Recalculate when the factor or quantity changes.
    if (req.body.quantity !== undefined || req.body.emission_factor_id !== undefined) {
      const { co2Amount, unit, autoCalculated } = await resolveCo2({
        emissionFactorId: req.body.emission_factor_id ?? existing.emission_factor_id,
        quantity: req.body.quantity ?? existing.quantity,
        manualCo2: req.body.co2_amount ?? existing.co2_amount,
      });
      patch = { ...patch, co2_amount: co2Amount, unit: patch.unit || unit, auto_calculated: autoCalculated };
    }

    const item = await carbonTransactionModel.update(req.params.id, patch);
    res.json({ success: true, message: 'Carbon transaction updated.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const removed = await carbonTransactionModel.remove(req.params.id);
    if (!removed) throw new ApiError(404, 'Carbon transaction not found.');
    res.json({ success: true, message: 'Carbon transaction deleted.' });
  } catch (err) {
    next(err);
  }
}

// Monthly totals for the dashboard trend chart.
async function summary(req, res, next) {
  try {
    const months = Math.min(24, parseInt(req.query.months, 10) || 12);
    const trend = await carbonTransactionModel.monthlyTotals(months);
    const byDepartment = await carbonTransactionModel.totalsByDepartment({
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ success: true, data: { trend, byDepartment } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, summary };
