const express = require('express');
const router = express.Router();
const LabOrder = require('../models/LabOrder');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/labs
// @desc    Get all lab orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }
    if (req.query.technician) {
      filter.technician = req.query.technician;
    }

    const labOrders = await LabOrder.find(filter)
      .populate('patient')
      .populate('doctor', 'name email department')
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, labOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/labs/:id
// @desc    Assign to technician / enter lab results
// @access  Private (Lab Technician, Doctor, Super Admin)
router.put('/:id', protect, async (req, res) => {
  const { status, resultDetails, remarks, technician } = req.body;

  try {
    const labOrder = await LabOrder.findById(req.params.id);
    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' });
    }

    if (technician !== undefined) labOrder.technician = technician;
    if (status !== undefined) {
      labOrder.status = status;
      if (status === 'Completed') {
        labOrder.dateCompleted = new Date();
      }
    }
    if (resultDetails !== undefined) labOrder.resultDetails = resultDetails;
    if (remarks !== undefined) labOrder.remarks = remarks;

    await labOrder.save();

    // If complete, we can attach this test result summary as a document to the patient's record!
    if (status === 'Completed') {
      const patient = await Patient.findById(labOrder.patient);
      if (patient) {
        patient.documents.push({
          name: `${labOrder.testName} Results`,
          docType: 'Lab Report',
          fileUrl: `LabOrder: ${labOrder._id}` // Link it to the lab order ID
        });
        await patient.save();
      }
    }

    const updated = await LabOrder.findById(labOrder._id)
      .populate('patient')
      .populate('doctor', 'name email department')
      .populate('technician', 'name email');

    res.json({ success: true, labOrder: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
