const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  services: [{
    name: String,
    cost: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    coverageAmount: Number,
    claimStatus: {
      type: String,
      enum: ['Not Submitted', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'],
      default: 'Not Submitted'
    }
  },
  payments: [{
    amount: Number,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Insurance'],
      default: 'Cash'
    },
    remarks: String
  }],
  status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  }
}, {
  timestamps: true
});

// Calculate total and balance before save
BillingSchema.pre('save', function() {
  let total = 0;
  this.services.forEach(service => {
    total += service.cost * (service.quantity || 1);
  });
  this.totalAmount = total;
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  if (this.balanceAmount <= 0) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partially Paid';
  } else {
    this.status = 'Unpaid';
  }
});

module.exports = mongoose.model('Billing', BillingSchema);
