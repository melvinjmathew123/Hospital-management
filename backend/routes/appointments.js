const express = require('express');
const router  = express.Router();
const {
  getAppointments,
  getSlotAvailability,
  createAppointment,
  updateAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateCreateAppointment, validateUpdateAppointment } = require('../middleware/validate');

router.get ('/availability', protect, getSlotAvailability);   // ?doctor=&date=
router.get ('/',             protect, getAppointments);
router.post('/',             protect, validateCreateAppointment, createAppointment);
router.put ('/:id',          protect, validateUpdateAppointment, updateAppointment);

module.exports = router;
