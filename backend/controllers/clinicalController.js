const Consultation = require('../models/Consultation');
const LabOrder = require('../models/LabOrder');
const Patient = require('../models/Patient');

// @desc  Get consultations (filterable by patient / doctor)
// @route GET /api/clinical/consultations
// @access Private
exports.getConsultations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.doctor) filter.doctor = req.query.doctor;

    const consultations = await Consultation.find(filter)
      .populate('patient')
      .populate('doctor', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ success: true, consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a consultation, write prescriptions, auto-create lab orders
// @route POST /api/clinical/consultations
// @access Private (Doctor)
exports.createConsultation = async (req, res) => {
  const { patient, diagnosis, treatmentPlan, medications, labOrders, referral, clinicalNotes } = req.body;
  const doctor = req.user._id;

  try {
    const patientObj = await Patient.findById(patient);
    if (!patientObj) return res.status(404).json({ success: false, message: 'Patient not found' });

    const consultation = await Consultation.create({
      patient, doctor, diagnosis, treatmentPlan,
      medications: medications || [],
      labOrders: labOrders || [],
      referral, clinicalNotes,
    });

    // Auto-create Lab Orders if doctor ordered lab tests
    if (labOrders && labOrders.length > 0) {
      const ordersToCreate = labOrders.map((testName) => ({ patient, doctor, testName, status: 'Pending' }));
      await LabOrder.insertMany(ordersToCreate);
    }

    // Update patient medical history
    patientObj.medicalHistory.push({
      condition: diagnosis,
      diagnosedDate: new Date(),
      notes: `Treatment Plan: ${treatmentPlan}. Prescribed: ${
        medications ? medications.map((m) => m.name).join(', ') : 'None'
      }`,
    });
    await patientObj.save();

    const populated = await Consultation.findById(consultation._id)
      .populate('patient')
      .populate('doctor', 'name email department');
    res.status(201).json({ success: true, consultation: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
