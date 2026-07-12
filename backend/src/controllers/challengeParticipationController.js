// EcoSphere - Join challenge, progress, proof, approval, XP award
// Owner: yagna
const challengeParticipationModel = require('../models/challengeParticipationModel');
const challengeModel = require('../models/challengeModel');
const esgSettingsModel = require('../models/esgSettingsModel');
const ApiError = require('../utils/apiError');
const { notify } = require('../utils/notificationService');
const { evaluateBadges } = require('../utils/badgeEngine');

async function join(req, res, next) {
  try {
    const challenge = await challengeModel.findById(req.params.id);
    if (!challenge) throw new ApiError(404, 'Challenge not found.');
    if (challenge.status !== 'active') throw new ApiError(400, 'Only active challenges can be joined.');

    const existing = await challengeParticipationModel.findByChallengeAndEmployee(
      challenge.id, req.user.id
    );
    if (existing) throw new ApiError(409, 'You have already joined this challenge.');

    const item = await challengeParticipationModel.create({
      challenge_id: challenge.id,
      employee_id: req.user.id,
    });
    res.status(201).json({ success: true, message: `You joined "${challenge.title}".`, data: { item } });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const isApprover = ['admin', 'manager'].includes(req.user.role);
    const items = await challengeParticipationModel.listDetailed({
      approval_status: req.query.approval_status,
      challenge_id: req.query.challenge_id,
      employee_id: isApprover ? req.query.employee_id : req.user.id,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  try {
    const participation = await challengeParticipationModel.findById(req.params.id);
    if (!participation) throw new ApiError(404, 'Participation not found.');
    if (participation.employee_id !== req.user.id) {
      throw new ApiError(403, 'You can only update your own progress.');
    }
    if (participation.approval_status !== 'pending') {
      throw new ApiError(400, 'This participation has already been decided.');
    }
    const item = await challengeParticipationModel.update(participation.id, {
      progress: req.body.progress,
    });
    res.json({ success: true, message: 'Progress updated.', data: { item } });
  } catch (err) {
    next(err);
  }
}

async function uploadProof(req, res, next) {
  try {
    if (!req.file) throw new ApiError(400, 'No proof file was uploaded.');
    const participation = await challengeParticipationModel.findById(req.params.id);
    if (!participation) throw new ApiError(404, 'Participation not found.');
    if (participation.employee_id !== req.user.id) {
      throw new ApiError(403, 'You can only attach proof to your own participation.');
    }
    const item = await challengeParticipationModel.update(participation.id, {
      proof_path: `uploads/evidence/${req.file.filename}`,
    });
    res.json({ success: true, message: 'Proof uploaded.', data: { item } });
  } catch (err) {
    next(err);
  }
}

// Approval awards the challenge XP and re-evaluates badge unlock rules.
async function decide(req, res, next) {
  try {
    const approve = req.path.endsWith('/approve');
    const participation = await challengeParticipationModel.findById(req.params.id);
    if (!participation) throw new ApiError(404, 'Participation not found.');
    if (participation.approval_status !== 'pending') {
      throw new ApiError(400, 'This participation has already been decided.');
    }

    const challenge = await challengeModel.findById(participation.challenge_id);

    if (approve) {
      const settings = await esgSettingsModel.get();
      if ((settings.evidence_requirement || challenge.evidence_required) && !participation.proof_path) {
        throw new ApiError(400, 'Evidence is required: the employee must upload proof before approval.');
      }
    }

    const item = await challengeParticipationModel.update(participation.id, {
      approval_status: approve ? 'approved' : 'rejected',
      xp_awarded: approve ? challenge.xp : 0,
      progress: approve ? 100 : participation.progress,
      completed_at: approve ? new Date() : null,
    });

    await notify(participation.employee_id, {
      type: 'approval',
      title: approve ? `Challenge approved: +${challenge.xp} XP` : 'Challenge submission rejected',
      message: `Your submission for "${challenge.title}" was ${approve ? 'approved' : 'rejected'}.`,
      link: '/dashboard/gamification',
    });
    let newBadges = [];
    if (approve) newBadges = await evaluateBadges(participation.employee_id);

    res.json({
      success: true,
      message: `Participation ${approve ? 'approved' : 'rejected'}.`,
      data: { item, newBadges },
    });
  } catch (err) {
    next(err);
  }
}

// XP / points summary for the logged-in employee.
async function myXp(req, res, next) {
  try {
    const summary = await challengeParticipationModel.xpSummaryFor(req.user.id);
    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
}

module.exports = { join, list, updateProgress, uploadProof, decide, myXp };
