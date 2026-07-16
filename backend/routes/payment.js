const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { validateCreatePaymentOrder, validateVerifyPayment } = require('../middleware/validate');

router.post('/create-order', protect, validateCreatePaymentOrder, createOrder);
router.post('/verify',       protect, validateVerifyPayment,       verifyPayment);

module.exports = router;
