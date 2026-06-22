const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');

// @route   GET /api/billing
// @desc    Get all bills or filter by patient
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bills = await Billing.find(filter)
      .populate('patient')
      .sort({ createdAt: -1 });

    res.json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/billing/:id
// @desc    Get a single bill by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id).populate('patient');
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/billing
// @desc    Create a new bill (e.g. Admission/Consultation fee setup)
// @access  Private (Hospital Admin, Super Admin)
router.post('/', protect, async (req, res) => {
  const { patient, services, insuranceDetails } = req.body;
  try {
    const bill = new Billing({
      patient,
      services: services || [],
      insuranceDetails: insuranceDetails || { claimStatus: 'Not Submitted' }
    });

    await bill.save();
    const populated = await Billing.findById(bill._id).populate('patient');
    res.status(201).json({ success: true, bill: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/billing/:id/payments
// @desc    Record manual payment / installment
// @access  Private (Hospital Admin, Super Admin)
router.post('/:id/payments', protect, async (req, res) => {
  const { amount, method, remarks } = req.body;
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    bill.payments.push({
      amount: Number(amount),
      method,
      remarks
    });

    bill.paidAmount += Number(amount);
    await bill.save();

    const updated = await Billing.findById(bill._id).populate('patient');
    res.json({ success: true, bill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/billing/:id/insurance
// @desc    Update insurance/claims status
// @access  Private (Hospital Admin, Super Admin, Medical Coordinator)
router.put('/:id/insurance', protect, async (req, res) => {
  const { provider, policyNumber, coverageAmount, claimStatus } = req.body;
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (provider !== undefined) bill.insuranceDetails.provider = provider;
    if (policyNumber !== undefined) bill.insuranceDetails.policyNumber = policyNumber;
    if (coverageAmount !== undefined) bill.insuranceDetails.coverageAmount = coverageAmount;
    if (claimStatus !== undefined) bill.insuranceDetails.claimStatus = claimStatus;

    // If insurance claim is Settled, count the coverage amount as a paid amount
    if (claimStatus === 'Settled' && coverageAmount > 0) {
      // Avoid duplicate insurance payments
      const alreadyPaidInsurance = bill.payments.some(p => p.method === 'Insurance');
      if (!alreadyPaidInsurance) {
        bill.payments.push({
          amount: Number(coverageAmount),
          method: 'Insurance',
          remarks: `Settled by ${provider || 'Insurance provider'}`
        });
        bill.paidAmount += Number(coverageAmount);
      }
    }

    await bill.save();
    const updated = await Billing.findById(bill._id).populate('patient');
    res.json({ success: true, bill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
