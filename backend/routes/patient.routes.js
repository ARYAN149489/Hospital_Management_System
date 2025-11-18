// backend/routes/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const labTestController = require('../controllers/labTest.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { patientOnly } = require('../middleware/roleCheck.middleware');
const {upload} = require('../middleware/upload.middleware');

// Apply authentication and patient-only middleware to all routes
router.use(authenticate);
router.use(patientOnly);

/**
 * @route   GET /api/patients/profile
 * @desc    Get patient profile
 * @access  Private (Patient)
 */
router.get('/profile', patientController.getProfile);

/**
 * @route   PUT /api/patients/profile
 * @desc    Update patient profile
 * @access  Private (Patient)
 */
router.put('/profile', patientController.updateProfile);

/**
 * @route   GET /api/patients/dashboard
 * @desc    Get patient dashboard data
 * @access  Private (Patient)
 */
router.get('/dashboard', (req, res, next) => {
  // Disable caching for dashboard data
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}, patientController.getDashboard);

/**
 * @route   GET /api/patients/medical-records
 * @desc    Get patient's medical records
 * @access  Private (Patient)
 */
router.get('/medical-records', patientController.getMedicalRecords);

/**
 * @route   POST /api/patients/medical-records
 * @desc    Upload medical record
 * @access  Private (Patient)
 */
router.post(
  '/medical-records',
  upload.single('file'),
  patientController.uploadMedicalRecord
);

/**
 * @route   GET /api/patients/prescriptions
 * @desc    Get patient's prescriptions
 * @access  Private (Patient)
 */
router.get('/prescriptions', patientController.getPrescriptions);

/**
 * @route   GET /api/patients/lab-tests
 * @desc    Get patient's lab tests
 * @access  Private (Patient)
 */
router.get('/lab-tests', patientController.getLabTests);

/**
 * @route   POST /api/patients/lab-tests/book
 * @desc    Book a new lab test
 * @access  Private (Patient)
 */
router.post('/lab-tests/book', labTestController.bookLabTest);

/**
 * @route   GET /api/patients/appointments/history
 * @desc    Get patient's appointment history
 * @access  Private (Patient)
 */
router.get('/appointments/history', patientController.getAppointmentHistory);

module.exports = router;