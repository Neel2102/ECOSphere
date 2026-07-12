// EcoSphere - Redeem reward (stock + points deduction)
// Owner: yagna
const rewardModel = require('../models/rewardModel');
const rewardRedemptionModel = require('../models/rewardRedemptionModel');
const challengeParticipationModel = require('../models/challengeParticipationModel');
const ApiError = require('../utils/apiError');
const { notify } = require('../utils/notificationService');

/*
 * Business rule: redeeming deducts points from the employee's balance and is
 * subject to stock. Stock is taken atomically first and restored if the
 * points check fails, so two concurrent redemptions can't oversell.
 */
async function redeem(req, res, next) {
  try {
    const rewardBefore = await rewardModel.findById(req.params.id);
    if (!rewardBefore) throw new ApiError(404, 'Reward not found.');

    const summary = await challengeParticipationModel.xpSummaryFor(req.user.id);
    if (summary.balance < rewardBefore.points_required) {
      throw new ApiError(
        400,
        `Not enough points: you have ${summary.balance}, this reward needs ${rewardBefore.points_required}.`
      );
    }

    const reward = await rewardModel.takeStock(req.params.id);
    if (!reward) throw new ApiError(400, 'This reward is out of stock.');

    let item;
    try {
      item = await rewardRedemptionModel.create({
        reward_id: reward.id,
        employee_id: req.user.id,
        points_spent: reward.points_required,
        status: 'fulfilled',
      });
    } catch (err) {
      await rewardModel.restoreStock(reward.id);
      throw err;
    }

    await notify(req.user.id, {
      type: 'general',
      title: `Reward redeemed: ${reward.name}`,
      message: `${reward.points_required} points were deducted. Remaining balance: ${summary.balance - reward.points_required}.`,
      link: '/dashboard/gamification/rewards',
    });

    res.status(201).json({
      success: true,
      message: `You redeemed "${reward.name}".`,
      data: { item, balance: summary.balance - reward.points_required, stockLeft: reward.stock },
    });
  } catch (err) {
    next(err);
  }
}

// Employees see their own redemptions; managers/admins see all.
async function list(req, res, next) {
  try {
    const isApprover = ['admin', 'manager'].includes(req.user.role);
    const items = await rewardRedemptionModel.listDetailed({
      employee_id: isApprover ? req.query.employee_id : req.user.id,
      organizationId: req.organizationId,
    });
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
}

module.exports = { redeem, list };
