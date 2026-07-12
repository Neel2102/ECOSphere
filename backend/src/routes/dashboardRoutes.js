// EcoSphere - Dashboard KPI + score endpoints
// Owner: yagna | Mounted at /api/dashboard
const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const scoreController = require('../controllers/scoreController');
const requireAuth = require('../middlewares/authMiddleware');

router.use(requireAuth);

router.get('/', dashboardController.overview);
router.get('/scores', scoreController.current);
router.get('/scores/history', scoreController.history);

module.exports = router;
