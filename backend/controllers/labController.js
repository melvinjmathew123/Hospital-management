const LabOrder  = require('../models/LabOrder');
const Patient   = require('../models/Patient');
const User      = require('../models/User');
const socketManager      = require('../utils/socketManager');
const { sendNotificationEmail } = require('../utils/mailer');

// @desc  Get all lab orders (filterable)
// @route GET /api/labs
// @access Private
exports.getLabOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)     filter.status     = req.query.status;
    if (req.query.patient)    filter.patient     = req.query.patient;
    if (req.query.technician) filter.technician  = req.query.technician;

    const labOrders = await LabOrder.find(filter)
      .populate('patient')
      .populate('doctor', 'name email department')
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, labOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update lab order (assign technician, enter results, mark complete)
// @route PUT /api/labs/:id
// @access Private
exports.updateLabOrder = async (req, res) => {
  const { status, resultDetails, remarks, technician } = req.body;
  try {
    const labOrder = await LabOrder.findById(req.params.id);
    if (!labOrder) return res.status(404).json({ success: false, message: 'Lab order not found' });

    if (technician !== undefined) labOrder.technician = technician;
    if (status !== undefined) {
      labOrder.status = status;
      if (status === 'Completed') labOrder.dateCompleted = new Date();
    }
    if (resultDetails !== undefined) labOrder.resultDetails = resultDetails;
    if (remarks    !== undefined) labOrder.remarks          = remarks;

    await labOrder.save();

    // Attach result summary as a patient document when completed
    if (status === 'Completed') {
      const patient = await Patient.findById(labOrder.patient);
      if (patient) {
        patient.documents.push({
          name:    `${labOrder.testName} Results`,
          docType: 'Lab Report',
          fileUrl: `LabOrder: ${labOrder._id}`,
        });
        await patient.save();
      }
    }

    const updated = await LabOrder.findById(labOrder._id)
      .populate('patient')
      .populate('doctor', 'name email department')
      .populate('technician', 'name email');

    // ── Notify doctor + patient when lab result is uploaded ────────────────────
    if (status === 'Completed') {
      try {
        const testName    = updated.testName   || 'Lab Test';
        const patientName = updated.patient?.name || 'the patient';

        // Notify the requesting doctor (in-app + email)
        if (updated.doctor) {
          socketManager.emitToUser(updated.doctor._id, {
            title: '🧪 Lab Results Ready',
            message: `Results for ${testName} (${patientName}) have been uploaded and are ready for review.`,
            type: 'lab',
            icon: '🧪',
          });

          if (updated.doctor.email) {
            sendNotificationEmail(
              updated.doctor.email,
              `Lab Results Ready — ${testName}`,
              'Lab Results Have Been Uploaded',
              `The lab results for <b>${testName}</b> for patient <b>${patientName}</b> have been completed and are now available in the system for your review.`,
              '🧪'
            ).catch(() => {});
          }
        }

        // Notify the patient (in-app + email)
        const patientUser = await User.findOne({ email: updated.patient?.email });
        if (patientUser) {
          socketManager.emitToUser(patientUser._id, {
            title: '📋 Your Lab Results Are Ready',
            message: `Your ${testName} results are now available. Log in to view your report.`,
            type: 'lab',
            icon: '📋',
          });

          if (updated.patient?.email) {
            sendNotificationEmail(
              updated.patient.email,
              `Your Lab Results Are Ready — ${testName}`,
              'Your Lab Results Are Available',
              `Your <b>${testName}</b> results have been completed and are now available in your patient portal. Please log in to view your report.`,
              '📋'
            ).catch(() => {});
          }
        }
      } catch (notifErr) {
        console.error('[Lab] Notification error:', notifErr.message);
      }
    }

    res.json({ success: true, labOrder: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
