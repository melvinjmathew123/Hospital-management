const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['OPD', 'IPD', 'ICU', 'Emergency', 'Laboratory', 'Pharmacy', 'Other'],
    default: 'OPD'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', DepartmentSchema);
