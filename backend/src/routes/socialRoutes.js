// EcoSphere - Social module: CSR activities, participation, diversity
// Owner: kavya | Mounted at /api/social
const router = require('express').Router();
const csrActivityController = require('../controllers/csrActivityController');
const employeeParticipationController = require('../controllers/employeeParticipationController');
const socialValidators = require('../validators/socialValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const { uploadEvidence } = require('../middlewares/evidenceUploadMiddleware');

router.use(requireAuth);
const canManage = allowRoles('admin', 'manager');
const canParticipate = allowRoles('admin', 'manager', 'employee');

// CSR activities
router.get('/activities', csrActivityController.list);
router.get('/activities/:id', csrActivityController.get);
router.post('/activities', canManage, socialValidators.activity, csrActivityController.create);
router.put('/activities/:id', canManage, socialValidators.activity, csrActivityController.update);
router.delete('/activities/:id', canManage, csrActivityController.remove);
router.post('/activities/:id/join', canParticipate, employeeParticipationController.join);

// Participation queue + proof + decisions
router.get('/participations', employeeParticipationController.list);
router.post('/participations/:id/proof', canParticipate, uploadEvidence, employeeParticipationController.uploadProof);
router.patch('/participations/:id/approve', canManage, socialValidators.approvalDecision, employeeParticipationController.decide);
router.patch('/participations/:id/reject', canManage, employeeParticipationController.decide);

// Diversity dashboard
router.get('/diversity', employeeParticipationController.diversity);

const trainingRoutes = require('./trainingRoutes');
router.use('/training', trainingRoutes);

module.exports = router;

