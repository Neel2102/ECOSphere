// EcoSphere - Training module routes
const router = require('express').Router();
const trainingController = require('../controllers/trainingController');
const trainingValidators = require('../validators/trainingValidators');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.use(requireAuth);
const canManage = allowRoles('admin', 'manager');

// Course routes
router.get('/courses', trainingController.listCourses);
router.get('/courses/:id', trainingController.getCourse);
router.post('/courses', canManage, trainingValidators.course, trainingController.createCourse);
router.put('/courses/:id', canManage, trainingValidators.course, trainingController.updateCourse);
router.delete('/courses/:id', canManage, trainingController.removeCourse);

// Record routes
router.get('/records', trainingController.listRecords);
router.get('/records/:id', trainingController.getRecord);
router.post('/records', trainingValidators.record, trainingController.createRecord);
router.put('/records/:id', canManage, trainingValidators.record, trainingController.updateRecord);
router.delete('/records/:id', canManage, trainingController.removeRecord);

// Summary stats
router.get('/stats', trainingController.getStats);

module.exports = router;
