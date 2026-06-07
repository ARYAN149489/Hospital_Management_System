// backend/routes/adminLabTest.routes.js
const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTest.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');

// Apply authentication and admin-only middleware to all routes
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   GET /api/admin/lab-tests
 * @desc    Get all lab tests
 * @access  Private (Admin)
 */
router.get('/', labTestController.getAllLabTests);

/**
 * @route   GET /api/admin/lab-tests/:id
 * @desc    Get lab test by ID
 * @access  Private (Admin)
 */
router.get('/:id', labTestController.getLabTestById);

/**
 * @route   PATCH /api/admin/lab-tests/:id/result
 * @desc    Update lab test result (after 2 days)
 * @access  Private (Admin)
 */
router.patch('/:id/result', labTestController.updateLabTestResult);

/**
 * @route   PATCH /api/admin/lab-tests/:id/status
 * @desc    Update lab test status
 * @access  Private (Admin)
 */
router.patch('/:id/status', labTestController.updateLabTestStatus);

module.exports = router;
