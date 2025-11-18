// backend/routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (with filters and pagination)
 * @access  Public
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('minRating')
      .optional({ values: 'falsy' })  // Treat empty strings as missing
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5'),
    query('minExperience')
      .optional({ values: 'falsy' })  // Treat empty strings as missing
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive number'),
    query('maxFee')
      .optional({ values: 'falsy' })  // Treat empty strings as missing
      .isFloat({ min: 0 })
      .withMessage('Fee must be a positive number'),
    validate
  ],
  doctorController.getAllDoctors
);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors
 * @access  Public
 */
router.get(
  '/search',
  [
    query('query')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    validate
  ],
  doctorController.searchDoctors
);

/**
 * @route   GET /api/doctors/top-rated
 * @desc    Get top rated doctors
 * @access  Public
 */
router.get(
  '/top-rated',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20'),
    validate
  ],
  doctorController.getTopRatedDoctors
);

/**
 * @route   GET /api/doctors/specialization/:specialization
 * @desc    Get doctors by specialization
 * @access  Public
 */
router.get(
  '/specialization/:specialization',
  [
    param('specialization')
      .notEmpty()
      .withMessage('Specialization is required')
      .trim(),
    validate
  ],
  doctorController.getDoctorsBySpecialization
);

/**
 * @route   GET /api/doctors/department/:departmentId
 * @desc    Get doctors by department
 * @access  Public
 */
router.get(
  '/department/:departmentId',
  [
    param('departmentId')
      .isMongoId()
      .withMessage('Invalid department ID'),
    validate
  ],
  doctorController.getDoctorsByDepartment
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get single doctor by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    validate
  ],
  doctorController.getDoctorById
);

/**
 * @route   GET /api/doctors/:id/availability
 * @desc    Get doctor availability
 * @access  Public
 */
router.get(
  '/:id/availability',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    validate
  ],
  doctorController.getDoctorAvailability
);

module.exports = router;