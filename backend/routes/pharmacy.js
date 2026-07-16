const express = require('express');
const router = express.Router();
const { getInventory, addInventory, updateInventory, dispenseMedication } = require('../controllers/pharmacyController');
const { protect } = require('../middleware/auth');
const { validateCreateInventory, validateUpdateInventory, validateDispense } = require('../middleware/validate');

router.get ('/inventory',       protect,                           getInventory);
router.post('/inventory',       protect, validateCreateInventory,  addInventory);
router.put ('/inventory/:id',   protect, validateUpdateInventory,  updateInventory);
router.post('/dispense',        protect, validateDispense,          dispenseMedication);

module.exports = router;
