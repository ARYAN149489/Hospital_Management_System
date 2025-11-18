// backend/routes/doctorDashboard.routes.js
const express = require('express');
const router = express.Router();
const doctorDashboardController = require('../controllers/doctorDashboard.controller');
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { doctorOnly } = require('../middleware/roleCheck.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Apply authentication and doctor-only middleware to all routes
router.use(authenticate);
router.use(doctorOnly);

/**
 * @route   GET /api/doctor/profile
 * @desc    Get doctor's own profile
 * @access  Private (Doctor)
 */
router.get('/profile', doctorDashboardController.getProfile);

/**
 * @route   PUT /api/doctor/profile
 * @desc    Update doctor's own profile
 * @access  Private (Doctor)
 */
router.put(
  '/profile',
  [
    body('consultationFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Consultation fee must be a positive number'),
    body('languages')
      .optional()
      .isArray()
      .withMessage('Languages must be an array'),
    validate
  ],
  doctorDashboardController.updateProfile
);

/**
 * @route   GET /api/doctor/dashboard
 * @desc    Get doctor dashboard data
 * @access  Private (Doctor)
 */
router.get('/dashboard', doctorDashboardController.getDashboard);

/**
 * @route   GET /api/doctor/appointments
 * @desc    Get doctor's appointments
 * @access  Private (Doctor)
 */
router.get(
  '/appointments',
  [
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'])
      .withMessage('Invalid status'),
    query('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    validate
  ],
  doctorDashboardController.getAppointments
);

/**
 * @route   GET /api/doctor/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private (Doctor)
 */
router.get(
  '/appointments/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    validate
  ],
  doctorDashboardController.getAppointmentById
);

/**
 * @route   PATCH /api/doctor/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Doctor)
 */
router.patch(
  '/appointments/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .withMessage('Invalid status'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes must not exceed 1000 characters'),
    validate
  ],
  doctorDashboardController.updateAppointmentStatus
);

/**
 * @route   GET /api/doctor/patients
 * @desc    Get doctor's patients list
 * @access  Private (Doctor)
 */
router.get('/patients', doctorDashboardController.getPatients);

/**
 * @route   GET /api/doctor/patients/:patientId
 * @desc    Get patient details and history
 * @access  Private (Doctor)
 */
router.get(
  '/patients/:patientId',
  [
    param('patientId')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    validate
  ],
  doctorDashboardController.getPatientDetails
);

/**
 * @route   GET /api/doctor/schedule
 * @desc    Get doctor's schedule/availability
 * @access  Private (Doctor)
 */
router.get('/schedule', doctorDashboardController.getSchedule);

/**
 * @route   PUT /api/doctor/schedule
 * @desc    Update doctor's schedule/availability
 * @access  Private (Doctor)
 */
router.put('/schedule', doctorDashboardController.updateSchedule);

/**
 * @route   GET /api/doctor/blocked-slots
 * @desc    Get doctor's blocked time slots
 * @access  Private (Doctor)
 */
router.get('/blocked-slots', doctorDashboardController.getBlockedSlots);

/**
 * @route   POST /api/doctor/block-slot
 * @desc    Block a time slot
 * @access  Private (Doctor)
 */
router.post('/block-slot', doctorDashboardController.blockSlot);

/**
 * @route   DELETE /api/doctor/blocked-slots/:id
 * @desc    Unblock a time slot
 * @access  Private (Doctor)
 */
router.delete('/blocked-slots/:id', doctorDashboardController.unblockSlot);

/**
 * @route   POST /api/doctor/prescriptions
 * @desc    Create new prescription
 * @access  Private (Doctor)
 */
router.post(
  '/prescriptions',
  [
    body('patientId')
      .notEmpty()
      .withMessage('Patient ID is required')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    body('diagnosis')
      .notEmpty()
      .withMessage('Diagnosis is required')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Diagnosis must be between 5 and 500 characters'),
    body('medications')
      .optional()
      .isArray()
      .withMessage('Medications must be an array'),
    validate
  ],
  prescriptionController.createPrescription
);

/**
 * @route   GET /api/doctor/prescriptions
 * @desc    Get doctor's prescriptions
 * @access  Private (Doctor)
 */
router.get(
  '/prescriptions',
  [
    query('patientId')
      .optional()
      .isMongoId()
      .withMessage('Invalid patient ID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validate
  ],
  doctorDashboardController.getPrescriptions
);

module.exports = router;