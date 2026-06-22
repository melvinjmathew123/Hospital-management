const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String, // E.g., "Essential Hypertension (I10)"
    required: true
  },
  treatmentPlan: {
    type: String,
    required: true
  },
  medications: [{
    name: String,
    dosage: String, // E.g., "500mg"
    frequency: String, // E.g., "Once daily", "Twice daily"
    duration: String // E.g., "7 days"
  }],
  labOrders: [String], // Array of test names ordered during consultation
  referral: {
    type: String // Recommended referral specialist / notes
  },
  clinicalNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
