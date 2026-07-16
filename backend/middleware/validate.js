const { validationResult, body, param } = require('express-validator');

/**
 * Runs express-validator results and returns a 422 if any errors exist.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ──────────────────────────────────────────────────────────────────────

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'])
    .withMessage('Invalid role'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s\-+().]{7,20}$/)
    .withMessage('Phone number format is invalid'),
  handleValidation,
];

const validateLogin = [
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateVerifyEmail = [
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only digits'),
  handleValidation,
];

const validateForgotPassword = [
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  handleValidation,
];

const validateResetPassword = [
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  handleValidation,
];

const validateVerifyOtp = [
  body('email')
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only digits'),
  handleValidation,
];

const validateUpdateUser = [
  body('email')
    .optional({ checkFalsy: true })
    .trim().toLowerCase()
    .isEmail().withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Lab Technician', 'Pharmacist', 'Patient'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s\-+().]{7,20}$/)
    .withMessage('Phone number format is invalid'),
  handleValidation,
];

// ─── Patients ──────────────────────────────────────────────────────────────────

const validateCreatePatient = [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-+().]{7,20}$/)
    .withMessage('Phone number format is invalid'),
  body('dob').isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  handleValidation,
];

const validateVitals = [
  body('temperature').optional({ checkFalsy: true }).isString().withMessage('Temperature must be a string value'),
  body('bloodPressure').optional({ checkFalsy: true }).isString().withMessage('Blood pressure must be a string value'),
  body('pulseRate').optional({ checkFalsy: true }).isString().withMessage('Pulse rate must be a string value'),
  body('spO2').optional({ checkFalsy: true }).isString().withMessage('SpO2 must be a string value'),
  body()
    .custom((_, { req }) => {
      const { temperature, bloodPressure, pulseRate, spO2 } = req.body;
      if (!temperature && !bloodPressure && !pulseRate && !spO2) {
        throw new Error('At least one vital sign must be provided');
      }
      return true;
    }),
  handleValidation,
];

const validateNurseNote = [
  body('note').trim().notEmpty().withMessage('Note content is required'),
  handleValidation,
];

const validatePatientDocument = [
  body('name').trim().notEmpty().withMessage('Document name is required'),
  body('docType').trim().notEmpty().withMessage('Document type is required'),
  body('fileUrl').notEmpty().withMessage('File URL is required').isURL().withMessage('File URL must be a valid URL'),
  handleValidation,
];

// ─── Appointments ──────────────────────────────────────────────────────────────

const validateCreateAppointment = [
  body('patient').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid patient ID'),
  body('doctor').notEmpty().withMessage('Doctor ID is required').isMongoId().withMessage('Invalid doctor ID'),
  body('date').isISO8601().withMessage('Date must be a valid ISO date'),
  body('timeSlot')
    .isIn(['Morning', 'Afternoon', 'Evening'])
    .withMessage('Time slot must be Morning, Afternoon, or Evening'),
  body('type')
    .optional()
    .isIn(['Walk-in', 'Online'])
    .withMessage('Type must be Walk-in or Online'),
  body('reason').optional({ checkFalsy: true }).trim().isString(),
  handleValidation,
];

const validateUpdateAppointment = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Scheduled', 'Completed', 'Cancelled', 'No-show'])
    .withMessage('Status must be Scheduled, Completed, Cancelled, or No-show'),
  handleValidation,
];

// ─── Hospital (Departments / Wards / Beds) ─────────────────────────────────────

const validateCreateDepartment = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('type')
    .notEmpty()
    .withMessage('Department type is required')
    .isIn(['OPD', 'IPD', 'ICU', 'Emergency', 'Laboratory', 'Pharmacy', 'General'])
    .withMessage('Invalid department type'),
  handleValidation,
];

const validateCreateWard = [
  body('name').trim().notEmpty().withMessage('Ward name is required'),
  body('department').notEmpty().withMessage('Department ID is required').isMongoId().withMessage('Invalid department ID'),
  body('type')
    .notEmpty()
    .withMessage('Ward type is required')
    .isIn(['General', 'ICU', 'Private', 'Semi-Private'])
    .withMessage('Ward type must be General, ICU, Private, or Semi-Private'),
  handleValidation,
];

const validateCreateBed = [
  body('bedNumber').trim().notEmpty().withMessage('Bed number is required'),
  body('ward').notEmpty().withMessage('Ward ID is required').isMongoId().withMessage('Invalid ward ID'),
  handleValidation,
];

const validateUpdateBed = [
  body('status')
    .optional()
    .isIn(['Available', 'Occupied', 'Under Maintenance'])
    .withMessage('Status must be Available, Occupied, or Under Maintenance'),
  body('currentPatient')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(val);
    })
    .withMessage('Invalid patient ID'),
  handleValidation,
];

// ─── Pharmacy ──────────────────────────────────────────────────────────────────

const validateCreateInventory = [
  body('drugName').trim().notEmpty().withMessage('Drug name is required'),
  body('dosageForm')
    .notEmpty()
    .withMessage('Dosage form is required')
    .isIn(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Patch', 'Other'])
    .withMessage('Invalid dosage form'),
  body('stockLevel')
    .notEmpty()
    .withMessage('Stock level is required')
    .isInt({ min: 0 })
    .withMessage('Stock level must be a non-negative integer'),
  body('expiryDate').isISO8601().withMessage('Expiry date must be a valid date'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer'),
  handleValidation,
];

const validateUpdateInventory = [
  body('stockLevel').optional().isInt({ min: 0 }).withMessage('Stock level must be a non-negative integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('threshold').optional().isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  handleValidation,
];

const validateDispense = [
  body('patientId').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid patient ID'),
  body('consultationId').notEmpty().withMessage('Consultation ID is required').isMongoId().withMessage('Invalid consultation ID'),
  body('dispensedItems')
    .isArray({ min: 1 })
    .withMessage('Dispensed items must be a non-empty array'),
  body('dispensedItems.*.drugId').isMongoId().withMessage('Each item must have a valid drug ID'),
  body('dispensedItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be at least 1'),
  handleValidation,
];

// ─── Billing ──────────────────────────────────────────────────────────────────

const validateCreateBill = [
  body('patient').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid patient ID'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('services.*.name').optional().notEmpty().withMessage('Service name is required'),
  body('services.*.cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Service cost must be a non-negative number'),
  body('services.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Service quantity must be at least 1'),
  handleValidation,
];

const validateRecordPayment = [
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'Card', 'UPI', 'Insurance', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('remarks').optional({ checkFalsy: true }).isString(),
  handleValidation,
];

const validateUpdateInsurance = [
  body('provider').optional({ checkFalsy: true }).isString().withMessage('Provider must be a string'),
  body('policyNumber').optional({ checkFalsy: true }).isString().withMessage('Policy number must be a string'),
  body('coverageAmount').optional().isFloat({ min: 0 }).withMessage('Coverage amount must be non-negative'),
  body('claimStatus')
    .optional()
    .isIn(['Not Submitted', 'Submitted', 'Under Review', 'Approved', 'Settled', 'Rejected'])
    .withMessage('Invalid claim status'),
  handleValidation,
];

// ─── Clinical ─────────────────────────────────────────────────────────────────

const validateCreateConsultation = [
  body('patient').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid patient ID'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('treatmentPlan').trim().notEmpty().withMessage('Treatment plan is required'),
  body('medications').optional().isArray().withMessage('Medications must be an array'),
  body('medications.*.name').optional().notEmpty().withMessage('Medication name is required'),
  body('labOrders').optional().isArray().withMessage('Lab orders must be an array'),
  handleValidation,
];

// ─── Labs ──────────────────────────────────────────────────────────────────────

const validateUpdateLabOrder = [
  body('status')
    .optional()
    .isIn(['Pending', 'Processing', 'Completed'])
    .withMessage('Status must be Pending, Processing, or Completed'),
  body('technician')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(val);
    })
    .withMessage('Invalid technician ID'),
  body('resultDetails').optional().isArray().withMessage('Result details must be an array'),
  body('remarks').optional({ checkFalsy: true }).isString(),
  handleValidation,
];

// ─── Payment ───────────────────────────────────────────────────────────────────

const validateCreatePaymentOrder = [
  body('billId').notEmpty().withMessage('Bill ID is required').isMongoId().withMessage('Invalid bill ID'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  handleValidation,
];

const validateVerifyPayment = [
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('billId').notEmpty().withMessage('Bill ID is required').isMongoId().withMessage('Invalid bill ID'),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  handleValidation,
];

module.exports = {
  handleValidation,
  // Auth
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
  validateUpdateUser,
  // Patients
  validateCreatePatient,
  validateVitals,
  validateNurseNote,
  validatePatientDocument,
  // Appointments
  validateCreateAppointment,
  validateUpdateAppointment,
  // Hospital
  validateCreateDepartment,
  validateCreateWard,
  validateCreateBed,
  validateUpdateBed,
  // Pharmacy
  validateCreateInventory,
  validateUpdateInventory,
  validateDispense,
  // Billing
  validateCreateBill,
  validateRecordPayment,
  validateUpdateInsurance,
  // Clinical
  validateCreateConsultation,
  // Labs
  validateUpdateLabOrder,
  // Payment
  validateCreatePaymentOrder,
  validateVerifyPayment,
};
