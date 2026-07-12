// EcoSphere - Compliance Issue CRUD + overdue flagging
// Owner: kavya
const complianceIssueModel = require('../models/complianceIssueModel');
const ApiError = require('../utils/apiError');
const { notify } = require('../utils/notificationService');

async function list(req, res, next) {
  try {
    const items = await complianceIssueModel.listDetailed({
      q: req.query.q,
      status: req.query.status,
      severity: req.query.severity,
      department_id: req.query.department_id,
      owner_id: req.query.mine === 'true' ? req.user.id : req.query.owner_id,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

// New issue -> its owner is notified (business rule: notification system).
async function create(req, res, next) {
  try {
    const item = await complianceIssueModel.create(req.body);
    await notify(item.owner_id, {
      type: 'compliance',
      title: 'New compliance issue assigned to you',
      message: `"${item.title}" (severity: ${item.severity}) is due ${new Date(item.due_date).toDateString()}.`,
      link: '/dashboard/governance/issues',
    });
    res.status(201).json({ success: true, message: 'Compliance issue raised.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const patch = { ...req.body };
    if (patch.status === 'resolved') patch.resolved_at = new Date();
    const item = await complianceIssueModel.update(req.params.id, patch);
    if (!item) throw new ApiError(404, 'Compliance issue not found.');
    res.json({ success: true, message: 'Compliance issue updated.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const removed = await complianceIssueModel.remove(req.params.id);
    if (!removed) throw new ApiError(404, 'Compliance issue not found.');
    res.json({ success: true, message: 'Compliance issue deleted.' });
  } catch (err) {
    next(err);
  }
}

// Flags open issues past their due date and notifies their owners.
// Called on demand (e.g. when the governance page loads).
async function flagOverdue(req, res, next) {
  try {
    const overdue = await complianceIssueModel.findNewlyOverdue();
    for (const issue of overdue) {
      await notify(issue.owner_id, {
        type: 'compliance',
        title: 'Compliance issue overdue',
        message: `"${issue.title}" passed its due date and is still ${issue.status}.`,
        link: '/dashboard/governance/issues',
      });
    }
    await complianceIssueModel.markOverdueNotified(overdue.map((issue) => issue.id));
    res.json({ success: true, data: { flagged: overdue.length } });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, flagOverdue };
