const express = require('express');
const router = express.Router();
const {
  getPatients, getPatientById, createPatient, updatePatient,
  recordVitals, recordNote, addDocument,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const {
  validateCreatePatient, validateVitals, validateNurseNote, validatePatientDocument,
} = require('../middleware/validate');

router.get ('/',                protect,                              getPatients);
router.get ('/:id',             protect,                              getPatientById);
router.post('/',                protect, validateCreatePatient,       createPatient);
router.put ('/:id',             protect,                              updatePatient);
router.post('/:id/vitals',      protect, validateVitals,              recordVitals);
router.post('/:id/notes',       protect, validateNurseNote,           recordNote);
router.post('/:id/documents',   protect, validatePatientDocument,     addDocument);

module.exports = router;
