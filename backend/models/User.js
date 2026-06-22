const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  phone: {
    type: String,
  },
  department: {
    type: String, // E.g., Cardiology, OPD, IPD, ICU, Emergency, General, Pharmacy, Lab
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String
  },
  otpExpires: {
    type: Date
  }
}, {
  timestamps: true,
});

// Encrypt password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user-entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
