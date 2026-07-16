const express = require('express');
const router = express.Router();
const { getBills, getBillById, createBill, recordPayment, updateInsurance } = require('../controllers/billingController');
const { protect } = require('../middleware/auth');
const { validateCreateBill, validateRecordPayment, validateUpdateInsurance } = require('../middleware/validate');

router.get ('/',                protect,                          getBills);
router.get ('/:id',             protect,                          getBillById);
router.post('/',                protect, validateCreateBill,      createBill);
router.post('/:id/payments',    protect, validateRecordPayment,   recordPayment);
router.put ('/:id/insurance',   protect, validateUpdateInsurance, updateInsurance);

module.exports = router;
