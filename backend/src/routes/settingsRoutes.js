// EcoSphere - Settings module: departments, categories, ESG config, notification settings
// Owner: dhrumil | Mounted at /api/settings
const router = require('express').Router();
const departmentController = require('../controllers/departmentController');
const categoryController = require('../controllers/categoryController');
const esgSettingsController = require('../controllers/esgSettingsController');
const settingsValidators = require('../validators/settingsValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.use(requireAuth);

// Departments (read: everyone signed in; write: admin/manager)
router.get('/departments', departmentController.list);
router.get('/departments/:id', departmentController.get);
router.post('/departments', allowRoles('admin', 'manager'), settingsValidators.department, departmentController.create);
router.put('/departments/:id', allowRoles('admin', 'manager'), settingsValidators.departmentUpdate, departmentController.update);
router.delete('/departments/:id', allowRoles('admin'), departmentController.remove);

// Categories
router.get('/categories', categoryController.list);
router.get('/categories/:id', categoryController.get);
router.post('/categories', allowRoles('admin', 'manager'), settingsValidators.category, categoryController.create);
router.put('/categories/:id', allowRoles('admin', 'manager'), settingsValidators.category, categoryController.update);
router.delete('/categories/:id', allowRoles('admin'), categoryController.remove);

// ESG configuration + notification preferences (single settings row)
router.get('/esg-config', esgSettingsController.getSettings);
router.put('/esg-config', allowRoles('admin'), settingsValidators.esgConfig, esgSettingsController.updateSettings);

module.exports = router;
