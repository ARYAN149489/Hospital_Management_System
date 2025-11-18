// backend/routes/prescription.routes.js
const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { doctorOnly, checkRole } = require('../middleware/roleCheck.middleware');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/prescriptions
 * @desc    Create new prescription
 * @access  Private (Doctor)
 */
router.post(
  '/',
  authenticate,
  doctorOnly,
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
    body('medications.*.name')
      .notEmpty()
      .withMessage('Medication name is required'),
    body('medications.*.dosage')
      .notEmpty()
      .withMessage('Medication dosage is required'),
    body('medications.*.frequency')
      .notEmpty()
      .withMessage('Medication frequency is required'),
    body('medications.*.duration')
      .notEmpty()
      .withMessage('Medication duration is required'),
    validate
  ],
  prescriptionController.createPrescription
);

/**
 * @route   GET /api/prescriptions/doctor/my-prescriptions
 * @desc    Get doctor's prescriptions
 * @access  Private (Doctor)
 */
router.get(
  '/doctor/my-prescriptions',
  authenticate,
  doctorOnly,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('patientId')
      .optional()
      .isMongoId()
      .withMessage('Invalid patient ID'),
    validate
  ],
  prescriptionController.getDoctorPrescriptions
);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get prescription by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid prescription ID'),
    validate
  ],
  prescriptionController.getPrescription
);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update prescription
 * @access  Private (Doctor)
 */
router.put(
  '/:id',
  authenticate,
  doctorOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid prescription ID'),
    body('diagnosis')
      .optional()
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('Diagnosis must be between 5 and 500 characters'),
    validate
  ],
  prescriptionController.updatePrescription
);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete prescription
 * @access  Private (Doctor)
 */
router.delete(
  '/:id',
  authenticate,
  doctorOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid prescription ID'),
    validate
  ],
  prescriptionController.deletePrescription
);

/**
 * @route   PATCH /api/prescriptions/:id/verify
 * @desc    Verify prescription (pharmacy)
 * @access  Private (Doctor/Admin)
 */
router.patch(
  '/:id/verify',
  authenticate,
  checkRole('doctor', 'admin'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid prescription ID'),
    body('pharmacyName')
      .notEmpty()
      .withMessage('Pharmacy name is required'),
    body('pharmacistName')
      .notEmpty()
      .withMessage('Pharmacist name is required'),
    validate
  ],
  prescriptionController.verifyPrescription
);

module.exports = router;