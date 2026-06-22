const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public (for initial setup) / Protected (Super Admin only in production)
router.post('/register', async (req, res) => {
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      department,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 15 * 60 * 1000)
    });

    if (role === 'Patient') {
      await Patient.create({
        name,
        email,
        phone: phone || '000-000-0000',
        dob: dob || new Date('2000-01-01'),
        gender: gender || 'Other',
        address: address || 'No Address Provided',
        status: 'OPD'
      });
    }

    // Log the OTP code to terminal console for development use
    console.log(`[AUTH-OTP] Registration OTP for ${email}: ${otp}`);

    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      otp, // local development helper
      message: 'Registration successful! Verification code sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify registration email OTP and activate user
// @access  Public
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'Inactive') {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
      }

      if (user.isVerified === false) {
        // Generate new OTP for verification if they login but aren't verified
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        console.log(`[AUTH-OTP] Login Verification OTP for ${email}: ${otp}`);

        return res.status(403).json({
          success: false,
          isVerified: false,
          otp, // local development helper
          message: 'Please verify your email address. A verification code has been sent.'
        });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          department: user.department
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route   GET /api/auth/users
// @desc    Get all users (e.g. lists of doctors, nurses, etc.)
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }

    const users = await User.find(filter).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user details (roles, activation status)
// @access  Private (Super Admin only)
router.put('/users/:id', protect, authorize('Super Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        department: updatedUser.department
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate OTP for forgot password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    await user.save();

    // Log the OTP code to terminal console for development use
    console.log(`[AUTH-OTP] Forgot Password OTP for ${email}: ${otp}`);

    res.json({ success: true, message: 'Verification code sent to your registered contact channel', otp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    res.json({ success: true, message: 'Verification code verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using verified OTP code
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Reset password (triggers the bcrypt presave hook)
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
