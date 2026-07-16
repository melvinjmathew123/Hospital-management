const Appointment = require('../models/Appointment');

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

// @desc  Book a new appointment
// @route POST /api/appointments
// @access Private
exports.createAppointment = async (req, res) => {
  const { patient, doctor, date, timeSlot, type, reason } = req.body;
  try {
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const slotExists = await Appointment.findOne({
      doctor,
      date: appointmentDate,
      timeSlot,
      status: { $ne: 'Cancelled' },
    });

    if (slotExists) {
      return res.status(400).json({ success: false, message: 'This slot is already booked for this doctor on this day' });
    }

    const appointment = await Appointment.create({ patient, doctor, date: appointmentDate, timeSlot, type, reason });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate('doctor', 'name email department');
    res.status(201).json({ success: true, appointment: populated });
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
    res.json({ success: true, appointment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
