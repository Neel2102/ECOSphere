const router = require('express').Router();
const profileController = require('../controllers/profileController');
const profileValidators = require('../validators/profileValidators');
const requireAuth = require('../middlewares/authMiddleware');
const { uploadProfileImage } = require('../middlewares/uploadMiddleware');

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.put('/', profileValidators.updateProfile, profileController.updateProfile);
router.post('/image', uploadProfileImage, profileController.uploadImage);

module.exports = router;
