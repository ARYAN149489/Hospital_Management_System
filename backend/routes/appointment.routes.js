// backend/routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { patientOnly } = require('../middleware/roleCheck.middleware');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Patient)
 */
router.post(
  '/',
  authenticate,
  patientOnly,
  [
    body('doctorId')
      .notEmpty()
      .withMessage('Doctor ID is required')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('time')
      .notEmpty()
      .withMessage('Time is required')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Invalid time format (use HH:MM)'),
    body('type')
      .notEmpty()
      .withMessage('Appointment type is required')
      .isIn(['in-person', 'emergency'])
      .withMessage('Invalid appointment type. Must be: in-person or emergency'),
    body('reason')
      .notEmpty()
      .withMessage('Reason for appointment is required')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Reason must be between 3 and 500 characters'),
    validate
  ],
  appointmentController.bookAppointment
);

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Get all my appointments (patient or doctor)
 * @access  Private
 */
router.get(
  '/my-appointments',
  authenticate,
  (req, res, next) => {
    console.log('🎯 my-appointments route matched!');
    next();
  },
  appointmentController.getMyAppointments
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment details
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    validate
  ],
  appointmentController.getAppointment
);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel appointment
 * @access  Private (Patient)
 */
router.patch(
  '/:id/cancel',
  authenticate,
  patientOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('cancelReason')
      .notEmpty()
      .withMessage('Cancel reason is required')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Cancel reason must be between 10 and 200 characters'),
    validate
  ],
  appointmentController.cancelAppointment
);

/**
 * @route   PATCH /api/appointments/:id/reschedule
 * @desc    Reschedule appointment
 * @access  Private (Patient)
 */
router.patch(
  '/:id/reschedule',
  authenticate,
  patientOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('newDate')
      .notEmpty()
      .withMessage('New date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('newTime')
      .notEmpty()
      .withMessage('New time is required')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Invalid time format (use HH:MM)'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Reason must not exceed 200 characters'),
    validate
  ],
  appointmentController.rescheduleAppointment
);

/**
 * @route   GET /api/appointments/available-slots/:doctorId
 * @desc    Get available slots for a doctor on a specific date
 * @access  Public
 */
router.get(
  '/available-slots/:doctorId',
  [
    param('doctorId')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    query('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    validate
  ],
  appointmentController.getAvailableSlots
);

/**
 * @route   PATCH /api/appointments/:id/rate
 * @desc    Rate and review appointment
 * @access  Private (Patient)
 */
router.patch(
  '/:id/rate',
  authenticate,
  patientOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('rating')
      .notEmpty()
      .withMessage('Rating is required')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('review')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Review must not exceed 500 characters'),
    validate
  ],
  appointmentController.rateAppointment
);

module.exports = router;