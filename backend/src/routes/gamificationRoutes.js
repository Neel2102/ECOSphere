// EcoSphere - Gamification module: challenges, participation, badges, rewards, leaderboard
// Owner: yagna | Mounted at /api/gamification
const router = require('express').Router();
const challengeController = require('../controllers/challengeController');
const challengeParticipationController = require('../controllers/challengeParticipationController');
const badgeController = require('../controllers/badgeController');
const rewardController = require('../controllers/rewardController');
const rewardRedemptionController = require('../controllers/rewardRedemptionController');
const leaderboardController = require('../controllers/leaderboardController');
const gamificationValidators = require('../validators/gamificationValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const { uploadEvidence } = require('../middlewares/evidenceUploadMiddleware');

router.use(requireAuth);
const canManage = allowRoles('admin', 'manager');
const canParticipate = allowRoles('admin', 'manager', 'employee');

// Challenges + lifecycle
router.get('/challenges', challengeController.list);
router.get('/challenges/:id', challengeController.get);
router.post('/challenges', canManage, gamificationValidators.challenge, challengeController.create);
router.put('/challenges/:id', canManage, gamificationValidators.challenge, challengeController.update);
router.delete('/challenges/:id', allowRoles('admin'), challengeController.remove);
router.patch('/challenges/:id/status', canManage, challengeController.changeStatus);
router.post('/challenges/:id/join', canParticipate, challengeParticipationController.join);

// Challenge participation
router.get('/participations', challengeParticipationController.list);
router.patch('/participations/:id/progress', canParticipate, gamificationValidators.progressUpdate, challengeParticipationController.updateProgress);
router.post('/participations/:id/proof', canParticipate, uploadEvidence, challengeParticipationController.uploadProof);
router.patch('/participations/:id/approve', canManage, challengeParticipationController.decide);
router.patch('/participations/:id/reject', canManage, challengeParticipationController.decide);

// Badges
router.get('/badges', badgeController.list);
router.post('/badges', canManage, gamificationValidators.badge, badgeController.create);
router.put('/badges/:id', canManage, gamificationValidators.badge, badgeController.update);
router.delete('/badges/:id', allowRoles('admin'), badgeController.remove);

// Rewards + redemption
router.get('/rewards', rewardController.list);
router.post('/rewards', canManage, gamificationValidators.reward, rewardController.create);
router.put('/rewards/:id', canManage, gamificationValidators.reward, rewardController.update);
router.delete('/rewards/:id', allowRoles('admin'), rewardController.remove);
router.post('/rewards/:id/redeem', canParticipate, rewardRedemptionController.redeem);
router.get('/redemptions', rewardRedemptionController.list);

// XP + leaderboard
router.get('/xp/me', challengeParticipationController.myXp);
router.get('/leaderboard', leaderboardController.leaderboard);

module.exports = router;
