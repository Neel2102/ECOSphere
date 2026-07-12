// EcoSphere - Join CSR activity, proof upload, approve/reject
// Owner: kavya
const employeeParticipationModel = require('../models/employeeParticipationModel');
const csrActivityModel = require('../models/csrActivityModel');
const esgSettingsModel = require('../models/esgSettingsModel');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');
const { notify } = require('../utils/notificationService');
const { evaluateBadges } = require('../utils/badgeEngine');

async function join(req, res, next) {
  try {
    const activity = await csrActivityModel.findById(req.params.id);
    if (!activity) throw new ApiError(404, 'CSR activity not found.');
    if (activity.status !== 'open') throw new ApiError(400, 'This activity is closed.');

    const existing = await employeeParticipationModel.findByActivityAndEmployee(
      activity.id, req.user.id
    );
    if (existing) throw new ApiError(409, 'You have already joined this activity.');

    const item = await employeeParticipationModel.create({
      activity_id: activity.id,
      employee_id: req.user.id,
    });
    res.status(201).json({ success: true, message: `You joined "${activity.title}".`, data: { item } });
  } catch (err) {
    next(err);
  }
}

// Employees see their own participations; managers/admins see the queue.
async function list(req, res, next) {
  try {
    const isApprover = ['admin', 'manager'].includes(req.user.role);
    const items = await employeeParticipationModel.listDetailed({
      approval_status: req.query.approval_status,
      activity_id: req.query.activity_id,
      employee_id: isApprover ? req.query.employee_id : req.user.id,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function uploadProof(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, 'No proof file was uploaded.');
    const participation = await employeeParticipationModel.findById(req.params.id);
    if (!participation) throw new ApiError(404, 'Participation not found.');
    if (participation.employee_id !== req.user.id) {
      throw new ApiError(403, 'You can only attach proof to your own participation.');
    }
    const item = await employeeParticipationModel.update(participation.id, {
      proof_path: `uploads/evidence/${req.file.filename}`,
    });
    res.json({ success: true, message: 'Proof uploaded.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function decide(req, res, next) {
  try {
    const approve = req.path.endsWith('/approve');
    const participation = await employeeParticipationModel.findById(req.params.id);
    if (!participation) throw new ApiError(404, 'Participation not found.');
    if (participation.approval_status !== 'pending') {
      throw new ApiError(400, 'This participation has already been decided.');
    }

    const activity = await csrActivityModel.findById(participation.activity_id);

    if (approve) {
      // Business rule: with Evidence Requirement ON, approval needs a proof file.
      const settings = await esgSettingsModel.get(req.organizationId);
      if ((settings.evidence_requirement || activity.evidence_required) && !participation.proof_path) {
        throw new ApiError(400, 'Evidence is required: the employee must upload proof before approval.');
      }
    }

    const item = await employeeParticipationModel.update(participation.id, {
      approval_status: approve ? 'approved' : 'rejected',
      points_earned: approve ? (req.body.points_earned ?? activity.points) : 0,
      completion_date: approve ? new Date() : null,
    });

    await notify(participation.employee_id, {
      type: 'approval',
      title: approve ? 'CSR participation approved' : 'CSR participation rejected',
      message: `Your participation in "${activity.title}" was ${approve ? 'approved' : 'rejected'}.`,
      link: '/dashboard/social',
    });
    if (approve) await evaluateBadges(participation.employee_id);

    res.json({
      success: true,
      message: `Participation ${approve ? 'approved' : 'rejected'}.`,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
}

// Gender breakdown per department (Diversity Dashboard tab).
async function diversity(req, res, next) {
  try {
    const departments = await userModel.diversityByDepartment(req.organizationId);
    const totals = departments.reduce(
      (acc, row) => ({
        total: acc.total + row.total,
        male: acc.male + row.male,
        female: acc.female + row.female,
        other: acc.other + row.other,
        unspecified: acc.unspecified + row.unspecified,
      }),
      { total: 0, male: 0, female: 0, other: 0, unspecified: 0 }
    );
    res.json({ success: true, data: { departments, totals } });
  } catch (err) {
    next(err);
  }
}

module.exports = { join, list, uploadProof, decide, diversity };
