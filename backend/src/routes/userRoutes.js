const router = require('express').Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');

router.get('/', requireAuth, allowRoles('admin', 'manager'), userController.listUsers);

module.exports = router;
