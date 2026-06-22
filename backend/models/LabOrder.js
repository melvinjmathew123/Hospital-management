const mongoose = require('mongoose');

const LabOrderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed'],
    default: 'Pending'
  },
  resultDetails: [{
    parameter: String, // E.g., "Hemoglobin", "WBC"
    value: String,
    normalRange: String,
    unit: String
  }],
  remarks: String,
  dateOrdered: {
    type: Date,
    default: Date.now
  },
  dateCompleted: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('LabOrder', LabOrderSchema);
