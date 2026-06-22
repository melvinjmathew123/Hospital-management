const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get appointments list (optionally filter by doctor, patient, date)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.doctor) {
      filter.doctor = req.query.doctor;
    }
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.date) {
      // Expecting YYYY-MM-DD
      const start = new Date(req.query.date);
      start.setHours(0,0,0,0);
      const end = new Date(req.query.date);
      end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient')
      .populate('doctor', 'name email department phone');
      
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private
router.post('/', protect, async (req, res) => {
  const { patient, doctor, date, timeSlot, type, reason } = req.body;
  try {
    // Check if slot is already taken for that doctor on that date
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0,0,0,0);
    
    const slotExists = await Appointment.findOne({
      doctor,
      date: appointmentDate,
      timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (slotExists) {
      return res.status(400).json({ success: false, message: 'This slot is already booked for this doctor on this day' });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      date: appointmentDate,
      timeSlot,
      type,
      reason
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name email department');

    res.status(201).json({ success: true, appointment: populatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name email department');

    res.json({ success: true, appointment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
