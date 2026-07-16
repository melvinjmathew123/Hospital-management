const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { sendOtpEmail } = require('../utils/mailer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' });

/** Generate a cryptographically-safe 6-digit OTP string */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return false;
  if (user === 'your_gmail_address@gmail.com' || pass === 'your_16_char_app_password_here') return false;
  return true;
};

// ─── Register ──────────────────────────────────────────────────────────────────

// @desc  Register a new user & send email OTP
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  const { name, email, password, role, phone, department, dob, gender, address } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (role === 'Patient') {
      const patientExists = await Patient.findOne({ email });
      if (patientExists) {
        return res.status(400).json({ success: false, message: 'Patient profile with this email already exists' });
      }
    }

    const otp = generateOtp();
    const user = await User.create({
      name, email, password, role, phone, department,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    });

    if (role === 'Patient') {
      await Patient.create({
        name, email,
        phone: phone || '000-000-0000',
        dob: dob || new Date('2000-01-01'),
        gender: gender || 'Other',
        address: address || 'No Address Provided',
        status: 'OPD',
      });
    }

    // Send OTP via email (non-fatal — falls back to server console log on failure)
    let emailDelivered = false;
    try {
      const result = await sendOtpEmail(email, otp, 'register');
      emailDelivered = !result.fallback && !result.dev;
    } catch (mailErr) {
      console.error(`[Auth] Email delivery failed for ${email}:`, mailErr.message);
    }

    const emailConfigured = isEmailConfigured();
    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      ...(emailConfigured ? {} : { otp }),
      message: emailConfigured
        ? 'Registration successful! A 6-digit verification code has been sent to your email.'
        : 'Registration successful! Email delivery is unavailable — use the OTP shown here to verify.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify Email ──────────────────────────────────────────────────────────────

// @desc  Verify registration email OTP & activate user
// @route POST /api/auth/verify-email
// @access Public
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You are now logged in.',
      token: generateToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status, phone: user.phone, department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Resend Verification OTP ───────────────────────────────────────────────────

// @desc  Resend email verification OTP
// @route POST /api/auth/resend-otp
// @access Public
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    let emailDelivered = false;
    try {
      const result = await sendOtpEmail(email, otp, 'register');
      emailDelivered = !result.fallback && !result.dev;
    } catch (mailErr) {
      console.error(`[Auth] Resend OTP email failed for ${email}:`, mailErr.message);
    }

    const emailConfigured = isEmailConfigured();
    res.json({
      success: true,
      ...(emailConfigured ? {} : { otp }),
      message: emailConfigured
        ? 'A new verification code has been sent to your email.'
        : 'Email delivery unavailable — use the OTP shown here.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────

// @desc  Authenticate user & get JWT token
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact the administrator.' });
    }

    if (!user.isVerified) {
      // Re-send fresh OTP so they can complete verification
      const otp = generateOtp();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      let emailDelivered = false;
      try {
        const result = await sendOtpEmail(email, otp, 'login');
        emailDelivered = !result.fallback && !result.dev;
      } catch (mailErr) {
        console.error(`[Auth] Login OTP email failed for ${email}:`, mailErr.message);
      }

      const emailConfigured = isEmailConfigured();
      return res.status(403).json({
        success: false,
        isVerified: false,
        ...(emailConfigured ? {} : { otp }),
        message: emailConfigured
          ? 'Your email is not verified. A verification code has been sent to your email.'
          : 'Email delivery unavailable — use the OTP shown here to verify.',
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status, phone: user.phone, department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Me ────────────────────────────────────────────────────────────────────

// @desc  Get current logged-in user's profile
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ─── Get Users ─────────────────────────────────────────────────────────────────

// @desc  List all users (filterable by role / department)
// @route GET /api/auth/users
// @access Private
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;

    const users = await User.find(filter).select('-password -otpCode -otpExpires');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update User ───────────────────────────────────────────────────────────────

// @desc  Update user by ID (Super Admin only)
// @route PUT /api/auth/users/:id
// @access Private (Super Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name       = req.body.name       || user.name;
    user.email      = req.body.email      || user.email;
    user.role       = req.body.role       || user.role;
    user.status     = req.body.status     || user.status;
    user.phone      = req.body.phone      || user.phone;
    user.department = req.body.department || user.department;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      success: true,
      user: {
        _id: updated._id, name: updated.name, email: updated.email,
        role: updated.role, status: updated.status, phone: updated.phone, department: updated.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

// @desc  Send password-reset OTP to registered email
// @route POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message to avoid user enumeration
      return res.json({ success: true, message: 'If an account with that email exists, a reset code has been sent.' });
    }

    const otp = generateOtp();
    user.otpCode   = otp;
    user.otpExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    let emailDelivered = false;
    try {
      const result = await sendOtpEmail(email, otp, 'forgot');
      emailDelivered = !result.fallback && !result.dev;
    } catch (mailErr) {
      console.error(`[Auth] Forgot-password email failed for ${email}:`, mailErr.message);
    }

    const emailConfigured = isEmailConfigured();
    res.json({
      success: true,
      ...(emailConfigured ? {} : { otp }),
      message: emailConfigured
        ? 'A password-reset code has been sent to your email.'
        : 'Email delivery unavailable — use the OTP shown here.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

// @desc  Validate an OTP without taking further action (pre-reset check)
// @route POST /api/auth/verify-otp
// @access Public
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    res.json({ success: true, message: 'Code verified. You may now reset your password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

// @desc  Reset password after OTP verification
// @route POST /api/auth/reset-password
// @access Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.password   = newPassword; // triggers bcrypt pre-save hook
    user.otpCode    = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
