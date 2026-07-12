// EcoSphere - Acknowledge policy + acknowledgement status/reminders
// Owner: kavya
const policyAcknowledgementModel = require('../models/policyAcknowledgementModel');
const esgPolicyModel = require('../models/esgPolicyModel');
const ApiError = require('../utils/apiError');
const { notifyMany } = require('../utils/notificationService');

async function acknowledge(req, res, next) {
  try {
    const policy = await esgPolicyModel.findById(req.params.id);
    if (!policy) throw new ApiError(404, 'Policy not found.');
    if (policy.status !== 'active') throw new ApiError(400, 'Only active policies can be acknowledged.');
    const item = await policyAcknowledgementModel.acknowledge(policy.id, req.user.id);
    res.json({ success: true, message: `Policy "${policy.title}" acknowledged.`, data: { item } });
  } catch (err) {
    next(err);
  }
}

// Matrix of (policy x employee) acknowledgement status.
async function listStatus(req, res, next) {
  try {
    const items = await policyAcknowledgementModel.listStatus({
      policy_id: req.query.policy_id,
      pendingOnly: req.query.pending === 'true',
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

// Sends a reminder notification to everyone who has not acknowledged yet.
async function remind(req, res, next) {
  try {
    const pending = await policyAcknowledgementModel.listStatus({
      policy_id: req.query.policy_id,
      pendingOnly: true,
    });
    const byEmployee = new Map();
    for (const row of pending) {
      if (!byEmployee.has(row.employee_id)) byEmployee.set(row.employee_id, []);
      byEmployee.get(row.employee_id).push(row.policy_title);
    }
    await Promise.all(
      [...byEmployee.entries()].map(([employeeId, titles]) =>
        notifyMany([employeeId], {
          type: 'policy_reminder',
          title: 'Policy acknowledgement pending',
          message: `Please acknowledge: ${titles.join(', ')}.`,
          link: '/dashboard/governance/acknowledgements',
        })
      )
    );
    res.json({
      success: true,
      message: `Reminders sent to ${byEmployee.size} employee(s).`,
      data: { reminded: byEmployee.size },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { acknowledge, listStatus, remind };
