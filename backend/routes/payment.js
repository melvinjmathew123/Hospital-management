const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Billing = require('../models/Billing');
const { protect } = require('../middleware/auth');

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
  });
} catch (error) {
  console.error('Failed to initialize Razorpay SDK:', error.message);
}

// @route   POST /api/payment/create-order
// @desc    Create a new payment order with Razorpay
// @access  Private (Patient/Admin)
router.post('/create-order', protect, async (req, res) => {
  const { billId, amount } = req.body;

  try {
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Determine target payment amount
    const paymentAmount = amount ? Number(amount) : bill.balanceAmount;

    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Cannot make payment for zero or negative amount' });
    }

    if (paymentAmount > bill.balanceAmount) {
      return res.status(400).json({ success: false, message: 'Payment amount exceeds outstanding balance' });
    }

    // Convert to paise (Razorpay standard: amount in minor unit)
    const amountInPaise = Math.round(paymentAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bill._id.toString().slice(-6)}`,
      notes: {
        billId: bill._id.toString(),
        patientId: bill.patient.toString()
      }
    };

    if (!razorpay || process.env.RAZORPAY_KEY_ID === 'dummy_key') {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured or initialized properly on the server.'
      });
    }

    const order = await razorpay.orders.create(options);

    // Save Razorpay order ID to billing record
    bill.razorpayOrderId = order.id;
    await bill.save();

    res.json({
      success: true,
      order_id: order.id,
      amount: paymentAmount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment signature and update ledger record
// @access  Private (Patient/Admin)
router.post('/verify', protect, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, billId, amount } = req.body;

  try {
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !billId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required parameters for verification' });
    }

    // Verify cryptographic signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Transaction verification signature mismatch' });
    }

    // Locate the bill
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Matching bill not found' });
    }

    // Log the transaction
    bill.payments.push({
      amount: Number(amount),
      method: 'Online',
      remarks: `Razorpay Payment ID: ${razorpay_payment_id}`
    });

    bill.paidAmount += Number(amount);
    
    // Clear razorpayOrderId reference now that order is settled
    bill.razorpayOrderId = null;
    
    await bill.save();

    const populatedBill = await Billing.findById(bill._id).populate('patient');

    res.json({
      success: true,
      message: 'Payment completed and verified successfully',
      bill: populatedBill
    });
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
