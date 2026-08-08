const crypto  = require('crypto');
const Razorpay = require('razorpay');
const Billing  = require('../models/Billing');
const User     = require('../models/User');
const socketManager = require('../utils/socketManager');

// ─── Lazy Razorpay initialization ─────────────────────────────────────────────
// Initialized on the first real request so that dotenv is guaranteed to have
// loaded all env vars before we read them.
let _razorpay = null;

function getRazorpay() {
  if (_razorpay) return _razorpay;
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  console.log('[Payment] Razorpay SDK initialized.');
  return _razorpay;
}

// ─── Create Order ──────────────────────────────────────────────────────────────
// @route  POST /api/payment/create-order
// @access Private
exports.createOrder = async (req, res) => {
  const { billId, amount } = req.body;

  // Read simulation flag at request time (not module load time)
  const isSimulation = process.env.RAZORPAY_SIMULATION_MODE === 'true';

  try {
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const paymentAmount = amount ? Number(amount) : bill.balanceAmount;

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot make payment for zero or negative amount',
      });
    }

    if (paymentAmount > bill.balanceAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds outstanding balance',
      });
    }

    // ── Demo / Simulation path ─────────────────────────────────────────────────
    if (isSimulation) {
      const orderId = `mock_order_${Math.random().toString(36).substring(2, 11)}`;
      bill.razorpayOrderId = orderId;
      await bill.save();

      return res.json({
        success:      true,
        order_id:     orderId,
        amount:       paymentAmount,   // in rupees
        currency:     'INR',
        key_id:       'rzp_test_simulation',
        is_simulated: true,
      });
    }

    // ── Real Razorpay path ─────────────────────────────────────────────────────
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({
        success: false,
        message:
          'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env, ' +
          'or set RAZORPAY_SIMULATION_MODE=true for demo mode.',
      });
    }

    const amountInPaise = Math.round(paymentAmount * 100); // Razorpay API expects paise
    const options = {
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `rcpt_${bill._id.toString().slice(-8)}`,
      notes: {
        billId:    bill._id.toString(),
        patientId: bill.patient.toString(),
      },
    };

    let order;
    try {
      order = await rzp.orders.create(options);
    } catch (rzpError) {
      console.error('[Payment] Razorpay order creation failed:', rzpError);
      const msg =
        rzpError?.error?.description ||
        rzpError?.message ||
        'Failed to create Razorpay order. Check your API credentials.';
      return res.status(502).json({ success: false, message: msg });
    }

    bill.razorpayOrderId = order.id;
    await bill.save();

    return res.json({
      success:  true,
      order_id: order.id,
      amount:   paymentAmount,   // rupees — frontend multiplies ×100 for Razorpay options
      currency: order.currency,
      key_id:   process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('[Payment] createOrder error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Verify Payment ────────────────────────────────────────────────────────────
// @route  POST /api/payment/verify
// @access Private
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    billId,
    amount,
  } = req.body;

  try {
    // Detect simulation / mock payments by their order_id prefix
    const isMock =
      (razorpay_order_id   && razorpay_order_id.startsWith('mock_order_')) ||
      (razorpay_payment_id && razorpay_payment_id.startsWith('pay_mock_'));

    if (!isMock) {
      // ── Cryptographic HMAC signature verification ────────────────────────────
      if (!razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay signature is missing from the payment response.',
        });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({
          success: false,
          message: 'Server misconfiguration: RAZORPAY_KEY_SECRET is not set.',
        });
      }

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed. Transaction not recorded.',
        });
      }
    }

    // ── Record payment on the bill ─────────────────────────────────────────────
    const bill = await Billing.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const paymentAmount = Number(amount);

    bill.payments.push({
      amount:  paymentAmount,
      method:  'Online',
      remarks: isMock
        ? `Demo/Simulation Payment | ID: ${razorpay_payment_id}`
        : `Razorpay Payment | ID: ${razorpay_payment_id}`,
    });
    bill.paidAmount      += paymentAmount;
    bill.razorpayOrderId  = null;
    await bill.save();

    const populated = await Billing.findById(bill._id).populate('patient');

    // ── Notify Hospital Admins of payment received ─────────────────────────────
    try {
      const admins = await User.find({ role: 'Hospital Admin' });
      const patientName = populated.patient?.name || 'A patient';
      socketManager.emitToRole('Hospital Admin', {
        title: '💳 Payment Received',
        message: `${patientName} made a payment of ₹${paymentAmount} via ${isMock ? 'Demo Mode' : 'Razorpay'}.`,
        type: 'payment',
        icon: '💳',
      }, admins);
    } catch (notifErr) {
      console.error('[Payment] Notification error:', notifErr.message);
    }

    return res.json({
      success: true,
      message: 'Payment verified and recorded successfully.',
      bill:    populated,
    });
  } catch (error) {
    console.error('[Payment] verifyPayment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
