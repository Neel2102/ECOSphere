// EcoSphere - Governance module: policies, acknowledgements, audits, compliance issues
// Owner: kavya | Mounted at /api/governance
const router = require('express').Router();
const esgPolicyController = require('../controllers/esgPolicyController');
const policyAcknowledgementController = require('../controllers/policyAcknowledgementController');
const auditController = require('../controllers/auditController');
const complianceIssueController = require('../controllers/complianceIssueController');
const governanceValidators = require('../validators/governanceValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.use(requireAuth);
const canManage = allowRoles('admin', 'manager');

// Policies
router.get('/policies', esgPolicyController.list);
router.get('/policies/:id', esgPolicyController.get);
router.post('/policies', canManage, governanceValidators.policy, esgPolicyController.create);
router.put('/policies/:id', canManage, governanceValidators.policy, esgPolicyController.update);
router.delete('/policies/:id', allowRoles('admin'), esgPolicyController.remove);
router.post('/policies/:id/acknowledge', policyAcknowledgementController.acknowledge);

// Acknowledgement status + reminders
router.get('/acknowledgements', policyAcknowledgementController.listStatus);
router.post('/acknowledgements/remind', canManage, policyAcknowledgementController.remind);

// Audits
router.get('/audits', auditController.list);
router.get('/audits/:id', auditController.get);
router.post('/audits', canManage, governanceValidators.audit, auditController.create);
router.put('/audits/:id', canManage, governanceValidators.audit, auditController.update);
router.delete('/audits/:id', allowRoles('admin'), auditController.remove);

// Compliance issues (owner + due date mandatory; overdue flagging)
router.get('/issues', complianceIssueController.list);
router.post('/issues', canManage, governanceValidators.complianceIssue, complianceIssueController.create);
router.put('/issues/:id', canManage, governanceValidators.complianceIssueUpdate, complianceIssueController.update);
router.delete('/issues/:id', allowRoles('admin'), complianceIssueController.remove);
router.post('/issues/flag-overdue', canManage, complianceIssueController.flagOverdue);

module.exports = router;
