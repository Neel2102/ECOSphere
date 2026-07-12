// EcoSphere - User administration endpoints
// Owner: dhrumil | Mounted at /api/users
const router = require('express').Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.get('/', requireAuth, allowRoles('admin', 'manager'), userController.listUsers);
router.post('/', requireAuth, allowRoles('admin'), userController.createUser);
router.patch('/:id', requireAuth, allowRoles('admin'), userController.updateUser);

module.exports = router;
