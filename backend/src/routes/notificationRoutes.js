// EcoSphere - Notification endpoints
// Owner: dhrumil | Mounted at /api/notifications
const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const requireAuth = require('../middlewares/authMiddleware');

router.use(requireAuth);

router.get('/', notificationController.listMine);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
