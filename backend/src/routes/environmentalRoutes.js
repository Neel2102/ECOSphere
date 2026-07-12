// EcoSphere - Environmental module: factors, product profiles, goals, carbon transactions
// Owner: neel | Mounted at /api/environmental
const router = require('express').Router();
const emissionFactorController = require('../controllers/emissionFactorController');
const productEsgProfileController = require('../controllers/productEsgProfileController');
const environmentalGoalController = require('../controllers/environmentalGoalController');
const carbonTransactionController = require('../controllers/carbonTransactionController');
const environmentalValidators = require('../validators/environmentalValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.use(requireAuth);
const canManage = allowRoles('admin', 'manager');

// Emission factors
router.get('/emission-factors', emissionFactorController.list);
router.get('/emission-factors/:id', emissionFactorController.get);
router.post('/emission-factors', canManage, environmentalValidators.emissionFactor, emissionFactorController.create);
router.put('/emission-factors/:id', canManage, emissionFactorController.update);
router.delete('/emission-factors/:id', canManage, emissionFactorController.remove);

// Product ESG profiles
router.get('/product-profiles', productEsgProfileController.list);
router.get('/product-profiles/:id', productEsgProfileController.get);
router.post('/product-profiles', canManage, environmentalValidators.productProfile, productEsgProfileController.create);
router.put('/product-profiles/:id', canManage, productEsgProfileController.update);
router.delete('/product-profiles/:id', canManage, productEsgProfileController.remove);

// Environmental goals
router.get('/goals', environmentalGoalController.list);
router.get('/goals/:id', environmentalGoalController.get);
router.post('/goals', canManage, environmentalValidators.goal, environmentalGoalController.create);
router.put('/goals/:id', canManage, environmentalGoalController.update);
router.delete('/goals/:id', canManage, environmentalGoalController.remove);

// Carbon transactions (+ monthly/department summary for charts)
router.get('/carbon-transactions', carbonTransactionController.list);
router.get('/carbon-transactions/summary', carbonTransactionController.summary);
router.post('/carbon-transactions', canManage, environmentalValidators.carbonTransaction, carbonTransactionController.create);
router.put('/carbon-transactions/:id', canManage, carbonTransactionController.update);
router.delete('/carbon-transactions/:id', canManage, carbonTransactionController.remove);

module.exports = router;
