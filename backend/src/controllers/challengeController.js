// EcoSphere - Challenge CRUD + lifecycle transitions
// Owner: yagna
const challengeModel = require('../models/challengeModel');
const ApiError = require('../utils/apiError');
const { makeCrudController } = require('../utils/crudFactory');

// Lifecycle: Draft -> Active -> Under Review -> Completed; Archived anytime.
const TRANSITIONS = {
  draft: ['active', 'archived'],
  active: ['under_review', 'archived'],
  under_review: ['completed', 'active', 'archived'],
  completed: ['archived'],
  archived: [],
};

const crud = makeCrudController(challengeModel, 'Challenge');

async function list(req, res, next) {
  try {
    const [items, statusCounts] = await Promise.all([
      challengeModel.listDetailed({
        q: req.query.q,
        status: req.query.status,
        category_id: req.query.category_id,
        forUserId: req.user.id,
        organizationId: req.organizationId,
      }),
      challengeModel.countsByStatus(req.organizationId),
    ]);
    res.json({ success: true, data: { items, statusCounts } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const item = await challengeModel.create({ ...req.body, created_by: req.user.id }, req.organizationId);
    res.status(201).json({ success: true, message: 'Challenge created.', data: { item } });
  } catch (err) {
    next(err);
  }
}

// Status changes go through here so invalid lifecycle jumps are rejected.
async function changeStatus(req, res, next) {
  try {
    const challenge = await challengeModel.findById(req.params.id);
    if (!challenge) throw new ApiError(404, 'Challenge not found.');
    const nextStatus = req.body.status;
    if (!TRANSITIONS[challenge.status]?.includes(nextStatus)) {
      throw new ApiError(
        400,
        `Cannot move a ${challenge.status} challenge to ${nextStatus}. Allowed: ${TRANSITIONS[challenge.status].join(', ') || 'none'}.`
      );
    }
    const item = await challengeModel.update(challenge.id, { status: nextStatus });
    res.json({ success: true, message: `Challenge is now ${nextStatus}.`, data: { item } });
  } catch (err) {
    next(err);
  }
}

module.exports = { ...crud, list, create, changeStatus };
