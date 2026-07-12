// EcoSphere - Badge auto-award rule evaluation (XP / completed challenges)
// Owner: yagna
const badgeModel = require('../models/badgeModel');
const challengeParticipationModel = require('../models/challengeParticipationModel');
const esgSettingsModel = require('../models/esgSettingsModel');
const { notify } = require('./notificationService');

/*
 * Checks every active badge against the employee's current XP and completed
 * challenge count, awards any that are newly unlocked, and notifies the
 * employee. No-op when the Badge Auto-Award toggle is off. Never throws.
 */
async function evaluateBadges(employeeId) {
  try {
    const userModel = require('../models/userModel');
    const user = await userModel.findById(employeeId);
    const orgId = user?.organization_id;
    const settings = await esgSettingsModel.get(orgId);
    if (!settings || !settings.badge_auto_award) return [];

    const [badges, earnedIds, summary] = await Promise.all([
      badgeModel.list({ where: { status: 'active', organization_id: orgId } }),
      badgeModel.earnedBadgeIds(employeeId),
      challengeParticipationModel.xpSummaryFor(employeeId),
    ]);

    const newlyAwarded = [];
    for (const badge of badges) {
      if (earnedIds.includes(badge.id)) continue;
      const metric =
        badge.unlock_rule_type === 'xp' ? summary.earned : summary.challenges_completed;
      if (metric >= badge.unlock_rule_value) {
        const awarded = await badgeModel.award(badge.id, employeeId);
        if (awarded) {
          newlyAwarded.push(badge);
          await notify(employeeId, {
            type: 'badge',
            title: `Badge unlocked: ${badge.name}`,
            message: badge.description || 'Congratulations on your new badge!',
            link: '/dashboard/gamification/badges',
          });
        }
      }
    }
    return newlyAwarded;
  } catch (err) {
    console.error('[badgeEngine] Evaluation failed:', err.message);
    return [];
  }
}

module.exports = { evaluateBadges };
