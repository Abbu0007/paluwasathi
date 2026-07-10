const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getMe,
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);
router.get('/me', auth, getMe);

module.exports = router;