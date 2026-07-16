const crypto = require('crypto');
const Razorpay = require('razorpay');
const Billing = require('../models/Billing');

// Initialize Razorpay instance (lazy-safe)
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
} catch (error) {
  console.error('Failed to initialize Razorpay SDK:', error.message);
}

// @desc  Create a Razorpay payment order
// @route POST /api/payment/create-order
// @access Private
exports.createOrder = async (req, res) => {
  const { billId, amount } = req.body;
  try {
    const bill = await Billing.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const paymentAmount = amount ? Number(amount) : bill.balanceAmount;

    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Cannot make payment for zero or negative amount' });
    }

    if (paymentAmount > bill.balanceAmount) {
      return res.status(400).json({ success: false, message: 'Payment amount exceeds outstanding balance' });
    }

    if (!razorpay || process.env.RAZORPAY_KEY_ID === 'dummy_key') {
      return res.status(500).json({
        success: false,
        message: 'Razorpay keys are not configured or initialized properly on the server.',
      });
    }

    const amountInPaise = Math.round(paymentAmount * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${bill._id.toString().slice(-6)}`,
      notes: { billId: bill._id.toString(), patientId: bill.patient.toString() },
    };

    const order = await razorpay.orders.create(options);
    bill.razorpayOrderId = order.id;
    await bill.save();

    res.json({
      success: true,
      order_id: order.id,
      amount: paymentAmount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify Razorpay signature and record payment
// @route POST /api/payment/verify
// @access Private
exports.verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, billId, amount } = req.body;
  try {
    // Verify cryptographic signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Transaction verification signature mismatch' });
    }

    const bill = await Billing.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: 'Matching bill not found' });

    bill.payments.push({
      amount: Number(amount),
      method: 'Online',
      remarks: `Razorpay Payment ID: ${razorpay_payment_id}`,
    });
    bill.paidAmount += Number(amount);
    bill.razorpayOrderId = null;
    await bill.save();

    const populated = await Billing.findById(bill._id).populate('patient');
    res.json({ success: true, message: 'Payment completed and verified successfully', bill: populated });
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
