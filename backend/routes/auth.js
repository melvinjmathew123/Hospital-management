const express = require('express');
const router = express.Router();
const {
  register, verifyEmail, resendOtp, login, getMe,
  getUsers, updateUser,
  forgotPassword, verifyOtp, resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateRegister, validateLogin, validateVerifyEmail,
  validateForgotPassword, validateResetPassword, validateVerifyOtp,
  validateUpdateUser,
} = require('../middleware/validate');

router.post('/register',        validateRegister,        register);
router.post('/verify-email',    validateVerifyEmail,     verifyEmail);
router.post('/resend-otp',      validateForgotPassword,  resendOtp);   // reuses email-only validation
router.post('/login',           validateLogin,           login);
router.get ('/me',              protect,                 getMe);
router.get ('/users',           protect,                 getUsers);
router.put ('/users/:id',       protect, authorize('Super Admin'), validateUpdateUser, updateUser);
router.post('/forgot-password', validateForgotPassword,  forgotPassword);
router.post('/verify-otp',      validateVerifyOtp,       verifyOtp);
router.post('/reset-password',  validateResetPassword,   resetPassword);

module.exports = router;
