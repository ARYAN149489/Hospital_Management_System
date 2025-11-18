// backend/middleware/validate.middleware.js
const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ Validation failed for request:', req.method, req.path);
    console.log('Request body:', req.body);
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Common validation rules
 */

// User Registration Validation
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = (new Date() - new Date(value)) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 0 || age > 150) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('role')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor'),
  
  validate
];

// Login Validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Update Profile Validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  validate
];

// Appointment Booking Validation
const validateAppointment = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      
      // Can't book more than 3 months in advance
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      if (appointmentDate > threeMonthsLater) {
        throw new Error('Cannot book appointments more than 3 months in advance');
      }
      
      return true;
    }),
  
  body('appointmentTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('appointmentType')
    .isIn(['in-person', 'emergency'])
    .withMessage('Appointment type must be in-person or emergency'),
  
  body('reasonForVisit')
    .trim()
    .notEmpty()
    .withMessage('Reason for visit is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason for visit must be between 10 and 500 characters'),
  
  validate
];

// Prescription Validation
const validatePrescription = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  
  body('diagnosis')
    .trim()
    .notEmpty()
    .withMessage('Diagnosis is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Diagnosis must be between 5 and 500 characters'),
  
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  
  body('medications.*.name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.dosage')
    .trim()
    .notEmpty()
    .withMessage('Medication dosage is required'),
  
  body('medications.*.frequency')
    .trim()
    .notEmpty()
    .withMessage('Medication frequency is required'),
  
  validate
];

// Lab Test Booking Validation
const validateLabTest = [
  body('testName')
    .trim()
    .notEmpty()
    .withMessage('Test name is required'),
  
  body('testCategory')
    .isIn(['Blood Test', 'Urine Test', 'Stool Test', 'Imaging', 'Biopsy', 'Culture Test', 'Genetic Test', 'Allergy Test', 'COVID-19 Test', 'Other'])
    .withMessage('Please select a valid test category'),
  
  body('labName')
    .trim()
    .notEmpty()
    .withMessage('Lab name is required'),
  
  body('scheduledDate')
    .isISO8601()
    .withMessage('Please provide a valid scheduled date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (scheduledDate < today) {
        throw new Error('Scheduled date cannot be in the past');
      }
      
      return true;
    }),
  
  body('scheduledTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('testType')
    .isIn(['home_collection', 'lab_visit', 'hospital'])
    .withMessage('Test type must be home_collection, lab_visit, or hospital'),
  
  validate
];

// Leave Application Validation
const validateLeave = [
  body('leaveType')
    .isIn(['sick_leave', 'casual_leave', 'vacation', 'emergency', 'maternity', 'paternity', 'compensatory', 'unpaid', 'other'])
    .withMessage('Please select a valid leave type'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }
      
      return true;
    }),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  validate
];

// MongoDB ID Validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  validate
];

// Pagination Validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// Search Validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  validate
];

// Date Range Validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
      }
      
      return true;
    }),
  
  validate
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateAppointment,
  validatePrescription,
  validateLabTest,
  validateLeave,
  validateMongoId,
  validatePagination,
  validateSearch,
  validateDateRange
};