const mongoose = require('mongoose');

const PharmacyInventorySchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true,
    unique: true
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'],
    default: 'Tablet'
  },
  stockLevel: {
    type: Number,
    required: true,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    default: 10 // Alert if stock drops below this
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PharmacyInventory', PharmacyInventorySchema);
