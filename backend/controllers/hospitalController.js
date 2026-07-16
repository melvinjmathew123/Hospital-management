const Department = require('../models/Department');
const Ward = require('../models/Ward');
const Bed = require('../models/Bed');

// ─── Departments ───────────────────────────────────────────────────────────────

// @desc  Get all departments
// @route GET /api/hospital/departments
// @access Private
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a department
// @route POST /api/hospital/departments
// @access Private (Super Admin)
exports.createDepartment = async (req, res) => {
  const { name, type } = req.body;
  try {
    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Department already exists' });

    const department = await Department.create({ name, type });
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Wards ─────────────────────────────────────────────────────────────────────

// @desc  Get all wards
// @route GET /api/hospital/wards
// @access Private
exports.getWards = async (req, res) => {
  try {
    const wards = await Ward.find().populate('department');
    res.json({ success: true, wards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a ward
// @route POST /api/hospital/wards
// @access Private (Super Admin)
exports.createWard = async (req, res) => {
  const { name, department, type } = req.body;
  try {
    const ward = await Ward.create({ name, department, type });
    const populated = await Ward.findById(ward._id).populate('department');
    res.status(201).json({ success: true, ward: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Beds ──────────────────────────────────────────────────────────────────────

// @desc  Get all beds
// @route GET /api/hospital/beds
// @access Private
exports.getBeds = async (req, res) => {
  try {
    const beds = await Bed.find()
      .populate({ path: 'ward', populate: { path: 'department' } })
      .populate('currentPatient');
    res.json({ success: true, beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a bed
// @route POST /api/hospital/beds
// @access Private (Super Admin)
exports.createBed = async (req, res) => {
  const { bedNumber, ward } = req.body;
  try {
    const bed = await Bed.create({ bedNumber, ward });
    const populated = await Bed.findById(bed._id).populate('ward');
    res.status(201).json({ success: true, bed: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update bed status / current patient
// @route PUT /api/hospital/beds/:id
// @access Private
exports.updateBed = async (req, res) => {
  const { status, currentPatient } = req.body;
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ success: false, message: 'Bed not found' });

    if (status !== undefined) bed.status = status;
    if (currentPatient !== undefined) bed.currentPatient = currentPatient || null;

    await bed.save();
    const updated = await Bed.findById(bed._id)
      .populate({ path: 'ward', populate: { path: 'department' } })
      .populate('currentPatient');
    res.json({ success: true, bed: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
