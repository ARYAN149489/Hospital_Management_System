// backend/routes/adminDashboard.routes.js
const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { query, body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Apply authentication and admin-only middleware to all routes
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get('/profile', adminDashboardController.getProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile
 * @access  Private (Admin)
 */
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid Indian phone number'),
    validate
  ],
  adminDashboardController.updateProfile
);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminDashboardController.getDashboard);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics (alias)
 * @access  Private (Admin)
 */
router.get('/stats', adminDashboardController.getDashboard);

/**
 * @route   GET /api/admin/statistics
 * @desc    Get detailed system statistics
 * @access  Private (Admin)
 */
router.get(
  '/statistics',
  [
    query('period')
      .optional()
      .isIn(['week', 'month', 'year'])
      .withMessage('Invalid period. Must be week, month, or year'),
    validate
  ],
  adminDashboardController.getSystemStatistics
);

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments (admin view)
 * @access  Private (Admin)
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
    query('doctorId')
      .optional()
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    query('patientId')
      .optional()
      .isMongoId()
      .withMessage('Invalid patient ID'),
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
  adminDashboardController.getAllAppointments
);

/**
 * @route   POST /api/admin/log-activity
 * @desc    Log admin activity
 * @access  Private (Admin)
 */
router.post(
  '/log-activity',
  [
    body('action')
      .notEmpty()
      .withMessage('Action is required')
      .trim(),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    validate
  ],
  adminDashboardController.logActivity
);

/**
 * @route   GET /api/admin/recent-activity
 * @desc    Get recent activity and pending items
 * @access  Private (Admin)
 */
router.get(
  '/recent-activity',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    validate
  ],
  adminDashboardController.getRecentActivity
);

/**
 * @route   GET /api/admin/system-health
 * @desc    Get system health status
 * @access  Private (Admin)
 */
router.get('/system-health', adminDashboardController.getSystemHealth);

module.exports = router;