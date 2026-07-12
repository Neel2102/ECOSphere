const router = require('express').Router();
const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidators');
const requireAuth = require('../middlewares/authMiddleware');

router.post('/signup', authValidators.signup, authController.signup);
router.post('/verify-otp', authValidators.verifyOtp, authController.verifyOtp);
router.post('/resend-otp', authValidators.emailOnly, authController.resendOtp);
router.post('/login', authValidators.login, authController.login);
router.post('/forgot-password', authValidators.emailOnly, authController.forgotPassword);
router.post('/verify-reset-otp', authValidators.verifyOtp, authController.verifyResetOtp);
router.post('/reset-password', authValidators.resetPassword, authController.resetPassword);
router.get('/me', requireAuth, authController.me);

module.exports = router;
