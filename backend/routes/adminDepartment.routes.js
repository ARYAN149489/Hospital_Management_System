// backend/routes/adminDepartment.routes.js
const express = require('express');
const router = express.Router();
const adminDepartmentController = require('../controllers/adminDepartment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Apply authentication and admin-only middleware to all routes
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   POST /api/admin/departments
 * @desc    Create new department
 * @access  Private (Admin)
 */
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Department name is required')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('code')
      .notEmpty()
      .withMessage('Department code is required')
      .trim()
      .isLength({ min: 2, max: 20 })
      .withMessage('Code must be between 2 and 20 characters')
      .isUppercase()
      .withMessage('Code must be in uppercase'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('headOfDepartment')
      .optional()
      .isMongoId()
      .withMessage('Invalid head of department ID'),
    body('services')
      .optional()
      .isArray()
      .withMessage('Services must be an array'),
    body('isEmergency')
      .optional()
      .isBoolean()
      .withMessage('isEmergency must be a boolean'),
    body('contactNumber')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid Indian phone number'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address'),
    validate
  ],
  adminDepartmentController.createDepartment
);

/**
 * @route   GET /api/admin/departments
 * @desc    Get all departments
 * @access  Private (Admin)
 */
router.get(
  '/',
  [
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    query('isEmergency')
      .optional()
      .isBoolean()
      .withMessage('isEmergency must be a boolean'),
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
  adminDepartmentController.getAllDepartments
);

/**
 * @route   GET /api/admin/departments/:id
 * @desc    Get department by ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    validate
  ],
  adminDepartmentController.getDepartmentById
);

/**
 * @route   PUT /api/admin/departments/:id
 * @desc    Update department
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('headOfDepartment')
      .optional()
      .isMongoId()
      .withMessage('Invalid head of department ID'),
    body('isEmergency')
      .optional()
      .isBoolean()
      .withMessage('isEmergency must be a boolean'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be a boolean'),
    validate
  ],
  adminDepartmentController.updateDepartment
);

/**
 * @route   DELETE /api/admin/departments/:id
 * @desc    Delete department
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    validate
  ],
  adminDepartmentController.deleteDepartment
);

/**
 * @route   PATCH /api/admin/departments/:id/status
 * @desc    Update department status
 * @access  Private (Admin)
 */
router.patch(
  '/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    body('isActive')
      .notEmpty()
      .withMessage('isActive is required')
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    validate
  ],
  adminDepartmentController.updateDepartmentStatus
);

/**
 * @route   PATCH /api/admin/departments/:id/beds
 * @desc    Update bed capacity
 * @access  Private (Admin)
 */
router.patch(
  '/:id/beds',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    body('total')
      .notEmpty()
      .withMessage('Total beds is required')
      .isInt({ min: 0 })
      .withMessage('Total beds must be a non-negative integer'),
    body('available')
      .notEmpty()
      .withMessage('Available beds is required')
      .isInt({ min: 0 })
      .withMessage('Available beds must be a non-negative integer'),
    validate
  ],
  adminDepartmentController.updateBedCapacity
);

module.exports = router;