const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Under Maintenance'],
    default: 'Available'
  },
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bed', BedSchema);
