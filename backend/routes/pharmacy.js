const express = require('express');
const router = express.Router();
const PharmacyInventory = require('../models/PharmacyInventory');
const Billing = require('../models/Billing');
const Consultation = require('../models/Consultation');
const { protect } = require('../middleware/auth');

// @route   GET /api/pharmacy/inventory
// @desc    Get all drug inventory
// @access  Private
router.get('/inventory', protect, async (req, res) => {
  try {
    const inventory = await PharmacyInventory.find();
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pharmacy/inventory
// @desc    Add new medicine to inventory
// @access  Private (Pharmacist, Super Admin)
router.post('/inventory', protect, async (req, res) => {
  const { drugName, dosageForm, stockLevel, expiryDate, price, threshold } = req.body;
  try {
    const exists = await PharmacyInventory.findOne({ drugName });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Drug already exists in inventory, please update stock instead' });
    }

    const drug = await PharmacyInventory.create({
      drugName,
      dosageForm,
      stockLevel,
      expiryDate,
      price,
      threshold
    });

    res.status(201).json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pharmacy/inventory/:id
// @desc    Update stock/price/threshold of an inventory item
// @access  Private (Pharmacist, Super Admin)
router.put('/inventory/:id', protect, async (req, res) => {
  const { stockLevel, price, threshold, expiryDate } = req.body;
  try {
    const drug = await PharmacyInventory.findById(req.params.id);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    if (stockLevel !== undefined) drug.stockLevel = stockLevel;
    if (price !== undefined) drug.price = price;
    if (threshold !== undefined) drug.threshold = threshold;
    if (expiryDate !== undefined) drug.expiryDate = expiryDate;

    await drug.save();
    res.json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pharmacy/dispense
// @desc    Dispense medications against a consultation/prescription & post to billing
// @access  Private (Pharmacist)
router.post('/dispense', protect, async (req, res) => {
  const { patientId, consultationId, dispensedItems } = req.body; // dispensedItems: [{ drugId, quantity }]
  
  try {
    // 1. Verify consultation prescription exists
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation prescription not found' });
    }

    // 2. Validate inventory stock levels & calculate costs
    const billingServices = [];
    
    for (const item of dispensedItems) {
      const drug = await PharmacyInventory.findById(item.drugId);
      if (!drug) {
        return res.status(404).json({ success: false, message: `Drug with ID ${item.drugId} not found` });
      }

      if (drug.stockLevel < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${drug.drugName}. Available: ${drug.stockLevel}` });
      }

      // Deduct stock
      drug.stockLevel -= item.quantity;
      await drug.save();

      // Push to billing item list
      billingServices.push({
        name: `Pharmacy: ${drug.drugName} (${drug.dosageForm})`,
        cost: drug.price,
        quantity: item.quantity
      });
    }

    // 3. Add charges to an existing Unpaid/Partially Paid bill or create a new one
    let bill = await Billing.findOne({ patient: patientId, status: { $ne: 'Paid' } });
    if (!bill) {
      bill = new Billing({
        patient: patientId,
        services: billingServices,
        paidAmount: 0
      });
    } else {
      // Append services
      bill.services.push(...billingServices);
    }
    
    await bill.save();

    res.json({
      success: true,
      message: 'Medication dispensed successfully and added to patient bill',
      bill
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
