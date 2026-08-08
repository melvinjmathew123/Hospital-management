const Appointment = require('../models/Appointment');
const User        = require('../models/User');
const socketManager      = require('../utils/socketManager');
const { sendNotificationEmail } = require('../utils/mailer');

// Maximum appointments allowed per doctor per time slot per day
const MAX_PER_SLOT = 10;

// @desc  Get appointments (filterable by doctor, patient, status, date)
// @route GET /api/appointments
// @access Private
exports.getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.patient) filter.patient = req.query.patient;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient')
      .populate('doctor', 'name email department phone');
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get slot availability for a doctor on a given date
// @route GET /api/appointments/availability?doctor=&date=
// @access Private
exports.getSlotAvailability = async (req, res) => {
  const { doctor, date } = req.query;
  if (!doctor || !date) {
    return res.status(400).json({ success: false, message: 'doctor and date are required' });
  }
  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const availability = {};

    for (const slot of slots) {
      const count = await Appointment.countDocuments({
        doctor,
        date: { $gte: start, $lte: end },
        timeSlot: slot,
        status: { $ne: 'Cancelled' },
      });
      availability[slot] = {
        booked: count,
        capacity: MAX_PER_SLOT,
        available: MAX_PER_SLOT - count,
        full: count >= MAX_PER_SLOT,
      };
    }

    res.json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Book a new appointment
// @route POST /api/appointments
// @access Private
exports.createAppointment = async (req, res) => {
  const { patient, doctor, date, timeSlot, type, reason } = req.body;
  try {
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Count existing active appointments for this doctor/slot/date
    const slotCount = await Appointment.countDocuments({
      doctor,
      date: appointmentDate,
      timeSlot,
      status: { $ne: 'Cancelled' },
    });

    if (slotCount >= MAX_PER_SLOT) {
      return res.status(400).json({
        success: false,
        message: `This ${timeSlot} slot is fully booked (${MAX_PER_SLOT}/${MAX_PER_SLOT}). Please choose a different slot or date.`,
      });
    }

    // Assign a slot number (1-based position within this slot)
    const slotNumber = slotCount + 1;

    const appointment = await Appointment.create({
      patient, doctor,
      date: appointmentDate,
      timeSlot,
      slotNumber,
      type, reason,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name email department');

    const remainingSlots = MAX_PER_SLOT - slotNumber;

    // ── Notify the assigned doctor (in-app + email) ────────────────────────────
    try {
      const doctorUser = await User.findById(doctor);
      const patientName = populated.patient?.name || 'A patient';
      const dateStr = appointmentDate.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      socketManager.emitToUser(doctor, {
        title: '📅 New Appointment Booked',
        message: `${patientName} booked slot #${slotNumber} (${timeSlot}) on ${dateStr}. ${remainingSlots} slots remaining.`,
        type: 'appointment',
        icon: '📅',
      });

      if (doctorUser?.email) {
        sendNotificationEmail(
          doctorUser.email,
          `New Appointment — ${patientName}`,
          'New Appointment Booked',
          `${patientName} has scheduled a <b>${type || 'consultation'}</b> appointment with you.<br/><br/>
           <b>Date:</b> ${dateStr}<br/>
           <b>Slot:</b> ${timeSlot} — Token #${slotNumber}<br/>
           <b>Reason:</b> ${reason || 'Not specified'}<br/><br/>
           ${remainingSlots} slots still available for this session.`,
          '📅'
        ).catch(() => {});
      }

      // Notify Hospital Admins
      const admins = await User.find({ role: 'Hospital Admin' });
      socketManager.emitToRole('Hospital Admin', {
        title: '📋 New Appointment',
        message: `${patientName} booked ${timeSlot} slot #${slotNumber} with Dr. ${doctorUser?.name || 'Unknown'} on ${dateStr}.`,
        type: 'appointment',
        icon: '📋',
      }, admins);
    } catch (notifErr) {
      console.error('[Appointment] Notification error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      appointment: populated,
      slotNumber,
      remainingSlots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update appointment status
// @route PUT /api/appointments/:id
// @access Private
exports.updateAppointment = async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (status) appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name email department');

    // ── Notify patient when status changes ─────────────────────────────────────
    try {
      if (status === 'Completed' || status === 'Cancelled') {
        const patientUser = await User.findOne({ email: updated.patient?.email });
        if (patientUser) {
          socketManager.emitToUser(patientUser._id, {
            title: status === 'Completed' ? '✅ Appointment Completed' : '❌ Appointment Cancelled',
            message: `Your appointment with Dr. ${updated.doctor?.name} has been marked as ${status}.`,
            type: status === 'Completed' ? 'success' : 'warning',
            icon: status === 'Completed' ? '✅' : '❌',
          });
        }
      }
    } catch (notifErr) {
      console.error('[Appointment] Status notification error:', notifErr.message);
    }

    res.json({ success: true, appointment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
