// backend/routes/leave.routes.js
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { doctorOnly } = require('../middleware/roleCheck.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/leaves
 * @desc    Create leave request
 * @access  Private (Doctor)
 */
router.post(
  '/',
  authenticate,
  doctorOnly,
  [
    body('leaveType')
      .notEmpty()
      .withMessage('Leave type is required')
      .isIn(['sick_leave', 'casual_leave', 'vacation', 'emergency', 'maternity', 'paternity', 'compensatory', 'unpaid', 'other'])
      .withMessage('Invalid leave type'),
    body('startDate')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('Invalid end date format'),
    body('reason')
      .notEmpty()
      .withMessage('Reason is required')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    body('isHalfDay')
      .optional()
      .isBoolean()
      .withMessage('isHalfDay must be a boolean'),
    body('halfDayType')
      .optional()
      .isIn(['first_half', 'second_half'])
      .withMessage('Invalid half day type'),
    body('substituteDoctor')
      .optional()
      .isMongoId()
      .withMessage('Invalid substitute doctor ID'),
    validate
  ],
  leaveController.createLeaveRequest
);

/**
 * @route   GET /api/leaves/my-leaves
 * @desc    Get doctor's leave requests
 * @access  Private (Doctor)
 */
router.get(
  '/my-leaves',
  authenticate,
  doctorOnly,
  [
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
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
  leaveController.getMyLeaves
);

/**
 * @route   GET /api/leaves/statistics
 * @desc    Get leave statistics for doctor
 * @access  Private (Doctor)
 */
router.get(
  '/statistics',
  authenticate,
  doctorOnly,
  leaveController.getLeaveStatistics
);

/**
 * @route   GET /api/leaves/:id
 * @desc    Get leave request by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid leave ID'),
    validate
  ],
  leaveController.getLeaveById
);

/**
 * @route   PUT /api/leaves/:id
 * @desc    Update leave request
 * @access  Private (Doctor)
 */
router.put(
  '/:id',
  authenticate,
  doctorOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid leave ID'),
    body('leaveType')
      .optional()
      .isIn(['sick', 'casual', 'vacation', 'emergency', 'maternity', 'paternity', 'other'])
      .withMessage('Invalid leave type'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    validate
  ],
  leaveController.updateLeaveRequest
);

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Cancel leave request
 * @access  Private (Doctor)
 */
router.delete(
  '/:id',
  authenticate,
  doctorOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid leave ID'),
    validate
  ],
  leaveController.cancelLeaveRequest
);

module.exports = router;