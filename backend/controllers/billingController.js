const Billing = require('../models/Billing');

// @desc  Get all bills (filterable by patient, status)
// @route GET /api/billing
// @access Private
exports.getBills = async (req, res) => {
  try {
    const filter = {};
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.status) filter.status = req.query.status;

    const bills = await Billing.find(filter).populate('patient').sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get a single bill by ID
// @route GET /api/billing/:id
// @access Private
exports.getBillById = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id).populate('patient');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a new bill
// @route POST /api/billing
// @access Private (Hospital Admin, Super Admin)
exports.createBill = async (req, res) => {
  const { patient, services, insuranceDetails } = req.body;
  try {
    const bill = new Billing({
      patient,
      services: services || [],
      insuranceDetails: insuranceDetails || { claimStatus: 'Not Submitted' },
    });
    await bill.save();
    const populated = await Billing.findById(bill._id).populate('patient');
    res.status(201).json({ success: true, bill: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Record a manual payment / installment
// @route POST /api/billing/:id/payments
// @access Private (Hospital Admin, Super Admin)
exports.recordPayment = async (req, res) => {
  const { amount, method, remarks } = req.body;
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.payments.push({ amount: Number(amount), method, remarks });
    bill.paidAmount += Number(amount);
    await bill.save();

    const updated = await Billing.findById(bill._id).populate('patient');
    res.json({ success: true, bill: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update insurance / claims details
// @route PUT /api/billing/:id/insurance
// @access Private
exports.updateInsurance = async (req, res) => {
  const { provider, policyNumber, coverageAmount, claimStatus } = req.body;
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    if (provider !== undefined) bill.insuranceDetails.provider = provider;
    if (policyNumber !== undefined) bill.insuranceDetails.policyNumber = policyNumber;
    if (coverageAmount !== undefined) bill.insuranceDetails.coverageAmount = coverageAmount;
    if (claimStatus !== undefined) bill.insuranceDetails.claimStatus = claimStatus;

    if (claimStatus === 'Settled' && coverageAmount > 0) {
      const alreadyPaid = bill.payments.some((p) => p.method === 'Insurance');
      if (!alreadyPaid) {
        bill.payments.push({
          amount: Number(coverageAmount),
          method: 'Insurance',
          remarks: `Settled by ${provider || 'Insurance provider'}`,
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
};
