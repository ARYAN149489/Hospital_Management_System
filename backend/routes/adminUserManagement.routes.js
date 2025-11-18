// backend/routes/adminUserManagement.routes.js
const express = require('express');
const router = express.Router();
const adminUserManagementController = require('../controllers/adminUserManagement.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/roleCheck.middleware');
const { param, query, body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Apply authentication and admin-only middleware to all routes
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get(
  '/users',
  [
    query('role')
      .optional()
      .isIn(['patient', 'doctor', 'admin'])
      .withMessage('Invalid role'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
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
  adminUserManagementController.getAllUsers
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get(
  '/users/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    validate
  ],
  adminUserManagementController.getUserById
);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin)
 */
router.patch(
  '/users/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('isActive')
      .notEmpty()
      .withMessage('isActive is required')
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    validate
  ],
  adminUserManagementController.updateUserStatus
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/users/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    validate
  ],
  adminUserManagementController.deleteUser
);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors (admin view)
 * @access  Private (Admin)
 */
router.get(
  '/doctors',
  [
    query('status')
      .optional()
      .isIn(['pending', 'active', 'rejected', 'suspended'])
      .withMessage('Invalid status'),
    query('department')
      .optional()
      .isMongoId()
      .withMessage('Invalid department ID'),
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
  adminUserManagementController.getAllDoctors
);

/**
 * @route   POST /api/admin/doctors/create
 * @desc    Create a new doctor (admin creates directly, no approval needed)
 * @access  Private (Admin)
 */
router.post(
  '/doctors/create',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('medicalLicenseNumber').notEmpty().withMessage('Medical license number is required'),
    body('yearsOfExperience').isInt({ min: 0 }).withMessage('Years of experience must be a positive number'),
    body('consultationFee').isInt({ min: 0 }).withMessage('Consultation fee must be a positive number'),
    body('qualifications').isArray({ min: 1 }).withMessage('At least one qualification is required'),
    validate
  ],
  adminUserManagementController.createDoctor
);

/**
 * @route   PATCH /api/admin/doctors/:id/approval
 * @desc    Approve or reject doctor
 * @access  Private (Admin)
 */
router.patch(
  '/doctors/:id/approval',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['active', 'rejected'])
      .withMessage('Status must be "active" or "rejected"'),
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty()
      .withMessage('Rejection reason is required when rejecting')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Rejection reason must be between 10 and 500 characters'),
    validate
  ],
  adminUserManagementController.updateDoctorApproval
);

/**
 * @route   PATCH /api/admin/doctors/:id/suspend
 * @desc    Suspend or activate doctor
 * @access  Private (Admin)
 */
router.patch(
  '/doctors/:id/suspend',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    body('suspended')
      .notEmpty()
      .withMessage('Suspended status is required')
      .isBoolean()
      .withMessage('Suspended must be a boolean'),
    body('suspensionReason')
      .if(body('suspended').equals(true))
      .notEmpty()
      .withMessage('Suspension reason is required when suspending')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Suspension reason must be between 10 and 500 characters'),
    validate
  ],
  adminUserManagementController.suspendDoctor
);

/**
 * @route   DELETE /api/admin/doctors/:id
 * @desc    Delete doctor and cancel all future appointments
 * @access  Private (Admin)
 */
router.delete(
  '/doctors/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    validate
  ],
  adminUserManagementController.deleteDoctor
);

/**
 * @route   POST /api/admin/doctors/:id/block
 * @desc    Block a doctor
 * @access  Private (Admin)
 */
router.post(
  '/doctors/:id/block',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    body('reason')
      .notEmpty()
      .withMessage('Block reason is required')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Block reason must be between 10 and 500 characters'),
    validate
  ],
  adminUserManagementController.blockDoctor
);

/**
 * @route   POST /api/admin/doctors/:id/unblock
 * @desc    Unblock a doctor
 * @access  Private (Admin)
 */
router.post(
  '/doctors/:id/unblock',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid doctor ID'),
    validate
  ],
  adminUserManagementController.unblockDoctor
);

/**
 * @route   GET /api/admin/leaves
 * @desc    Get all leave requests
 * @access  Private (Admin)
 */
router.get(
  '/leaves',
  [
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
    query('doctorId')
      .optional()
      .isMongoId()
      .withMessage('Invalid doctor ID'),
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
  adminUserManagementController.getAllLeaves
);

/**
 * @route   PATCH /api/admin/leaves/:id/approval
 * @desc    Approve or reject leave request
 * @access  Private (Admin)
 */
router.patch(
  '/leaves/:id/approval',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid leave ID'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be "approved" or "rejected"'),
    body('rejectionReason')
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Rejection reason must be between 10 and 500 characters'),
    validate
  ],
  adminUserManagementController.updateLeaveApproval
);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients (admin view)
 * @access  Private (Admin)
 */
router.get(
  '/patients',
  [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Search query must not be empty'),
    query('isActive')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('isActive must be true or false'),
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
  adminUserManagementController.getAllPatients
);

/**
 * @route   GET /api/admin/patients/:id
 * @desc    Get patient by ID
 * @access  Private (Admin)
 */
router.get(
  '/patients/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    validate
  ],
  adminUserManagementController.getPatientById
);

/**
 * @route   DELETE /api/admin/patients/:id
 * @desc    Delete patient
 * @access  Private (Admin)
 */
router.delete(
  '/patients/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    validate
  ],
  adminUserManagementController.deletePatient
);

/**
 * @route   GET /api/admin/patients/:id/appointments
 * @desc    Get patient appointments
 * @access  Private (Admin)
 */
router.get(
  '/patients/:id/appointments',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'])
      .withMessage('Invalid status'),
    validate
  ],
  adminUserManagementController.getPatientAppointments
);

/**
 * @route   GET /api/admin/patients/:id/prescriptions
 * @desc    Get patient prescriptions
 * @access  Private (Admin)
 */
router.get(
  '/patients/:id/prescriptions',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid patient ID'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validate
  ],
  adminUserManagementController.getPatientPrescriptions
);

module.exports = router;