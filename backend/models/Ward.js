const mongoose = require('mongoose');

const WardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  type: {
    type: String,
    enum: ['General', 'ICU', 'Private', 'Semi-Private'],
    default: 'General'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ward', WardSchema);
