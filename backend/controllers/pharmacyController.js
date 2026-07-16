const PharmacyInventory = require('../models/PharmacyInventory');
const Billing = require('../models/Billing');
const Consultation = require('../models/Consultation');

// @desc  Get full drug inventory
// @route GET /api/pharmacy/inventory
// @access Private
exports.getInventory = async (req, res) => {
  try {
    const inventory = await PharmacyInventory.find();
    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add new drug to inventory
// @route POST /api/pharmacy/inventory
// @access Private (Pharmacist, Super Admin)
exports.addInventory = async (req, res) => {
  const { drugName, dosageForm, stockLevel, expiryDate, price, threshold } = req.body;
  try {
    const exists = await PharmacyInventory.findOne({ drugName });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Drug already exists in inventory, please update stock instead' });
    }

    const drug = await PharmacyInventory.create({ drugName, dosageForm, stockLevel, expiryDate, price, threshold });
    res.status(201).json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update drug stock / price / threshold / expiry
// @route PUT /api/pharmacy/inventory/:id
// @access Private (Pharmacist, Super Admin)
exports.updateInventory = async (req, res) => {
  const { stockLevel, price, threshold, expiryDate } = req.body;
  try {
    const drug = await PharmacyInventory.findById(req.params.id);
    if (!drug) return res.status(404).json({ success: false, message: 'Drug not found' });

    if (stockLevel !== undefined) drug.stockLevel = stockLevel;
    if (price !== undefined) drug.price = price;
    if (threshold !== undefined) drug.threshold = threshold;
    if (expiryDate !== undefined) drug.expiryDate = expiryDate;

    await drug.save();
    res.json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Dispense medications and post charges to billing
// @route POST /api/pharmacy/dispense
// @access Private (Pharmacist)
exports.dispenseMedication = async (req, res) => {
  const { patientId, consultationId, dispensedItems } = req.body;
  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation prescription not found' });

    const billingServices = [];

    for (const item of dispensedItems) {
      const drug = await PharmacyInventory.findById(item.drugId);
      if (!drug) return res.status(404).json({ success: false, message: `Drug with ID ${item.drugId} not found` });

      if (drug.stockLevel < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${drug.drugName}. Available: ${drug.stockLevel}`,
        });
      }

      drug.stockLevel -= item.quantity;
      await drug.save();

      billingServices.push({
        name: `Pharmacy: ${drug.drugName} (${drug.dosageForm})`,
        cost: drug.price,
        quantity: item.quantity,
      });
    }

    let bill = await Billing.findOne({ patient: patientId, status: { $ne: 'Paid' } });
    if (!bill) {
      bill = new Billing({ patient: patientId, services: billingServices, paidAmount: 0 });
    } else {
      bill.services.push(...billingServices);
    }
    await bill.save();

    res.json({ success: true, message: 'Medication dispensed successfully and added to patient bill', bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
