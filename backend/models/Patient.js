const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true, // Allow multiple nulls if patient doesn't have portal account
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPD', 'Admitted', 'Discharged', 'Deceased'],
    default: 'OPD'
  },
  attendingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedBed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    default: null
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  documents: [{
    name: String,
    docType: String, // ID Proof, Insurance Card, Lab Report, etc.
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  vitals: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    temperature: String, // in °F or °C
    bloodPressure: String, // e.g. "120/80"
    pulseRate: String, // bpm
    spO2: String, // %
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  nurseNotes: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', PatientSchema);
