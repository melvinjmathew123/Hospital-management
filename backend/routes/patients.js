const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const { protect } = require('../middleware/auth');

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('attendingDoctor', 'name email')
      .populate('assignedBed');
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('attendingDoctor', 'name email phone')
      .populate({
        path: 'assignedBed',
        populate: { path: 'ward' }
      })
      .populate('vitals.recordedBy', 'name')
      .populate('nurseNotes.recordedBy', 'name');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  try {
    if (email) {
      const emailExists = await Patient.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already registered for a patient' });
      }
    }

    const patient = await Patient.create({
      name,
      email,
      phone,
      dob,
      gender,
      address,
      status: 'OPD'
    });

    res.status(201).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient details / admission / bed / doctor transfer
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const originalStatus = patient.status;
    const originalBed = patient.assignedBed;

    // Update simple fields
    patient.name = req.body.name || patient.name;
    patient.email = req.body.email || patient.email;
    patient.phone = req.body.phone || patient.phone;
    patient.dob = req.body.dob || patient.dob;
    patient.gender = req.body.gender || patient.gender;
    patient.address = req.body.address || patient.address;
    patient.attendingDoctor = req.body.attendingDoctor !== undefined ? req.body.attendingDoctor : patient.attendingDoctor;

    // Handle bed assignment/transfer/discharge
    if (req.body.status !== undefined) {
      patient.status = req.body.status;
    }

    if (req.body.assignedBed !== undefined) {
      patient.assignedBed = req.body.assignedBed || null;
    }

    // Logic for Admission / Transfer / Discharge Bed State
    if (patient.status === 'Admitted' && patient.assignedBed) {
      // If patient was admitted or transferred to a new bed
      if (!originalBed || originalBed.toString() !== patient.assignedBed.toString()) {
        // Free old bed if any
        if (originalBed) {
          await Bed.findByIdAndUpdate(originalBed, { status: 'Available', currentPatient: null });
        }
        // Occupy new bed
        await Bed.findByIdAndUpdate(patient.assignedBed, { status: 'Occupied', currentPatient: patient._id });
      }
    } else if (patient.status === 'Discharged' || !patient.assignedBed) {
      // If patient is discharged or bed removed
      if (originalBed) {
        await Bed.findByIdAndUpdate(originalBed, { status: 'Available', currentPatient: null });
      }
      patient.assignedBed = null;
    }

    await patient.save();

    const updatedPatient = await Patient.findById(patient._id)
      .populate('attendingDoctor', 'name email')
      .populate('assignedBed');

    res.json({ success: true, patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/patients/:id/vitals
// @desc    Record patient vitals
// @access  Private (Nurse, Doctor)
router.post('/:id/vitals', protect, async (req, res) => {
  const { temperature, bloodPressure, pulseRate, spO2 } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.vitals.push({
      temperature,
      bloodPressure,
      pulseRate,
      spO2,
      recordedBy: req.user._id
    });

    await patient.save();
    res.status(201).json({ success: true, vitals: patient.vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/patients/:id/notes
// @desc    Record nursing notes
// @access  Private (Nurse)
router.post('/:id/notes', protect, async (req, res) => {
  const { note } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.nurseNotes.push({
      note,
      recordedBy: req.user._id
    });

    await patient.save();
    res.status(201).json({ success: true, nurseNotes: patient.nurseNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/patients/:id/documents
// @desc    Upload / attach patient documents
// @access  Private
router.post('/:id/documents', protect, async (req, res) => {
  const { name, docType, fileUrl } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.documents.push({
      name,
      docType,
      fileUrl
    });

    await patient.save();
    res.status(201).json({ success: true, documents: patient.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
