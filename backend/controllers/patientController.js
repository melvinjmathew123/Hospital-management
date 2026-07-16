const Patient = require('../models/Patient');
const Bed = require('../models/Bed');

// @desc  Get all patients
// @route GET /api/patients
// @access Private
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('attendingDoctor', 'name email')
      .populate('assignedBed');
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single patient by ID
// @route GET /api/patients/:id
// @access Private
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('attendingDoctor', 'name email phone')
      .populate({ path: 'assignedBed', populate: { path: 'ward' } })
      .populate('vitals.recordedBy', 'name')
      .populate('nurseNotes.recordedBy', 'name');

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Register a new patient
// @route POST /api/patients
// @access Private
exports.createPatient = async (req, res) => {
  const { name, email, phone, dob, gender, address } = req.body;
  try {
    if (email) {
      const exists = await Patient.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered for a patient' });
    }

    const patient = await Patient.create({ name, email, phone, dob, gender, address, status: 'OPD' });
    res.status(201).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update patient (admission, transfer, discharge)
// @route PUT /api/patients/:id
// @access Private
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const originalBed = patient.assignedBed;

    patient.name = req.body.name || patient.name;
    patient.email = req.body.email || patient.email;
    patient.phone = req.body.phone || patient.phone;
    patient.dob = req.body.dob || patient.dob;
    patient.gender = req.body.gender || patient.gender;
    patient.address = req.body.address || patient.address;
    patient.attendingDoctor =
      req.body.attendingDoctor !== undefined ? req.body.attendingDoctor : patient.attendingDoctor;

    if (req.body.status !== undefined) patient.status = req.body.status;
    if (req.body.assignedBed !== undefined) patient.assignedBed = req.body.assignedBed || null;

    // Bed state management
    if (patient.status === 'Admitted' && patient.assignedBed) {
      if (!originalBed || originalBed.toString() !== patient.assignedBed.toString()) {
        if (originalBed) await Bed.findByIdAndUpdate(originalBed, { status: 'Available', currentPatient: null });
        await Bed.findByIdAndUpdate(patient.assignedBed, { status: 'Occupied', currentPatient: patient._id });
      }
    } else if (patient.status === 'Discharged' || !patient.assignedBed) {
      if (originalBed) await Bed.findByIdAndUpdate(originalBed, { status: 'Available', currentPatient: null });
      patient.assignedBed = null;
    }

    await patient.save();
    const updated = await Patient.findById(patient._id)
      .populate('attendingDoctor', 'name email')
      .populate('assignedBed');
    res.json({ success: true, patient: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Record vitals for a patient
// @route POST /api/patients/:id/vitals
// @access Private
exports.recordVitals = async (req, res) => {
  const { temperature, bloodPressure, pulseRate, spO2 } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.vitals.push({ temperature, bloodPressure, pulseRate, spO2, recordedBy: req.user._id });
    await patient.save();
    res.status(201).json({ success: true, vitals: patient.vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Record a nursing note
// @route POST /api/patients/:id/notes
// @access Private
exports.recordNote = async (req, res) => {
  const { note } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.nurseNotes.push({ note, recordedBy: req.user._id });
    await patient.save();
    res.status(201).json({ success: true, nurseNotes: patient.nurseNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Attach a document to a patient
// @route POST /api/patients/:id/documents
// @access Private
exports.addDocument = async (req, res) => {
  const { name, docType, fileUrl } = req.body;
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.documents.push({ name, docType, fileUrl });
    await patient.save();
    res.status(201).json({ success: true, documents: patient.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
