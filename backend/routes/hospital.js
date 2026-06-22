const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const { protect, authorize } = require('../middleware/auth');

// === Departments ===

// @route   GET /api/hospital/departments
// @desc    Get all departments
// @access  Private
router.get('/departments', protect, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/hospital/departments
// @desc    Create a department
// @access  Private (Super Admin only)
router.post('/departments', protect, authorize('Super Admin'), async (req, res) => {
  const { name, type } = req.body;
  try {
    const departmentExists = await Department.findOne({ name });
    if (departmentExists) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }
    const department = await Department.create({ name, type });
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// === Wards ===

// @route   GET /api/hospital/wards
// @desc    Get all wards with department details
// @access  Private
router.get('/wards', protect, async (req, res) => {
  try {
    const wards = await Ward.find().populate('department');
    res.json({ success: true, wards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/hospital/wards
// @desc    Create a ward
// @access  Private (Super Admin only)
router.post('/wards', protect, authorize('Super Admin'), async (req, res) => {
  const { name, department, type } = req.body;
  try {
    const ward = await Ward.create({ name, department, type });
    const populatedWard = await Ward.findById(ward._id).populate('department');
    res.status(201).json({ success: true, ward: populatedWard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// === Beds ===

// @route   GET /api/hospital/beds
// @desc    Get all beds with ward/patient info
// @access  Private
router.get('/beds', protect, async (req, res) => {
  try {
    const beds = await Bed.find()
      .populate({
        path: 'ward',
        populate: { path: 'department' }
      })
      .populate('currentPatient');
    res.json({ success: true, beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/hospital/beds
// @desc    Create a bed
// @access  Private (Super Admin only)
router.post('/beds', protect, authorize('Super Admin'), async (req, res) => {
  const { bedNumber, ward } = req.body;
  try {
    const bed = await Bed.create({ bedNumber, ward });
    const populatedBed = await Bed.findById(bed._id).populate('ward');
    res.status(201).json({ success: true, bed: populatedBed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/hospital/beds/:id
// @desc    Update bed status or occupant
// @access  Private (Nurse, Medical Coordinator, Super Admin, Hospital Admin)
router.put('/beds/:id', protect, async (req, res) => {
  const { status, currentPatient } = req.body;
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (status !== undefined) bed.status = status;
    if (currentPatient !== undefined) bed.currentPatient = currentPatient || null;

    await bed.save();
    const updatedBed = await Bed.findById(bed._id)
      .populate({
        path: 'ward',
        populate: { path: 'department' }
      })
      .populate('currentPatient');

    res.json({ success: true, bed: updatedBed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
