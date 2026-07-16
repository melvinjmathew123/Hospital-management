const express = require('express');
const router = express.Router();
const { getLabOrders, updateLabOrder } = require('../controllers/labController');
const { protect } = require('../middleware/auth');
const { validateUpdateLabOrder } = require('../middleware/validate');

router.get ('/',    protect,                          getLabOrders);
router.put ('/:id', protect, validateUpdateLabOrder,   updateLabOrder);

module.exports = router;
