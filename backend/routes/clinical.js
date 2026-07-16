const express = require('express');
const router = express.Router();
const { getConsultations, createConsultation } = require('../controllers/clinicalController');
const { protect, authorize } = require('../middleware/auth');
const { validateCreateConsultation } = require('../middleware/validate');

router.get ('/consultations', protect,                              getConsultations);
router.post('/consultations', protect, authorize('Doctor'), validateCreateConsultation, createConsultation);

module.exports = router;
