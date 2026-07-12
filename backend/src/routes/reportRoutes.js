// EcoSphere - Report + export endpoints
// Owner: yagna | Mounted at /api/reports
const router = require('express').Router();
const reportController = require('../controllers/reportController');
const requireAuth = require('../middlewares/authMiddleware');

router.use(requireAuth);

// :type = environmental | social | governance | summary | custom (&module=)
// ?format=json|csv|xlsx|pdf plus filters: department_id, employee_id,
// challenge_id, category_id, from, to
router.get('/:type', reportController.getReport);

module.exports = router;
