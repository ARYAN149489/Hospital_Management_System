// backend/controllers/labTest.controller.js
const catchAsync = require('../utils/catchAsync');
const LabTest = require('../models/LabTest.model');
const Patient = require('../models/Patient.model');
const Notification = require('../models/Notification.model');
const { generateLabTestId } = require('../utils/helpers');
const { sendResponse } = require('../utils/responseHandler');
const AppError = require('../utils/appError');

/**
 * @desc    Book a new lab test
 * @route   POST /api/patients/lab-tests/book
 * @access  Private (Patient)
 */
exports.bookLabTest = catchAsync(async (req, res) => {
  const {
    testName,
    testCategory,
    labName,
    labAddress,
    labPhone,
    scheduledDate,
    scheduledTime,
    testType,
    collectionAddress,
    fastingRequired,
    preparationInstructions,
    specialInstructions,
    amount
  } = req.body;

  // Validate required fields
  if (!testName || !testCategory || !scheduledDate || !scheduledTime || !amount) {
    throw new AppError('Please provide all required fields: testName, testCategory, scheduledDate, scheduledTime, amount', 400);
  }

  // Validate time slot is between 9 AM and 5 PM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(scheduledTime)) {
    throw new AppError('Invalid time format. Please use HH:MM format', 400);
  }

  const [hours] = scheduledTime.split(':').map(Number);
  if (hours < 9 || hours >= 17) {
    throw new AppError('Lab test bookings are only available between 9 AM and 5 PM', 400);
  }

  // Validate scheduled date is not in past
  const scheduled = new Date(scheduledDate);
  scheduled.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (scheduled < today) {
    throw new AppError('Scheduled date cannot be in the past', 400);
  }

  // Find patient
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    throw new AppError('Patient profile not found', 404);
  }

  // Generate unique lab test ID
  const labTestId = generateLabTestId();

  // Create lab test with default values for optional fields
  const labTest = await LabTest.create({
    labTestId,
    patient: patient._id,
    testName,
    testCategory,
    labName: labName || 'Hospital Lab',
    labAddress: labAddress || 'Hospital Address',
    labPhone: labPhone || 'N/A',
    scheduledDate,
    scheduledTime,
    testType: testType || 'hospital',
    collectionAddress,
    fastingRequired: fastingRequired || false,
    preparationInstructions,
    specialInstructions,
    status: 'booked',
    payment: {
      amount: amount,
      status: 'paid',
      method: 'card',
      paidAt: new Date(),
      finalAmount: amount
    }
  });

  // Populate patient details
  await labTest.populate({
    path: 'patient',
    populate: { path: 'user', select: 'firstName lastName email' }
  });

  // Create notification for patient
  await Notification.create({
    recipient: req.userId,
    type: 'lab_test_booked',
    title: 'Lab Test Booked Successfully',
    message: `Your ${testName} has been scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}.`,
    priority: 'medium',
    category: 'success',
    relatedEntity: {
      entityType: 'labtest',
      entityId: labTest._id
    }
  });

  return sendResponse(res, 201, true, 'Lab test booked successfully', labTest);
});

/**
 * @desc    Get all lab tests for admin
 * @route   GET /api/admin/lab-tests
 * @access  Private (Admin)
 */
exports.getAllLabTests = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;

  const query = {};

  // Filter by status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search by test name, lab test ID, or lab name
  if (search) {
    query.$or = [
      { testName: new RegExp(search, 'i') },
      { labTestId: new RegExp(search, 'i') },
      { labName: new RegExp(search, 'i') }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const labTests = await LabTest.find(query)
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone'
      }
    })
    .populate('prescribedBy', 'name specialization')
    .sort({ scheduledDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await LabTest.countDocuments(query);

  return res.status(200).json({
    success: true,
    count: labTests.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: labTests
  });
});

/**
 * @desc    Get lab test by ID (for admin)
 * @route   GET /api/admin/lab-tests/:id
 * @access  Private (Admin)
 */
exports.getLabTestById = catchAsync(async (req, res) => {
  const labTest = await LabTest.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone'
      }
    })
    .populate('prescribedBy', 'name specialization');

  if (!labTest) {
    throw new AppError('Lab test not found', 404);
  }

  return sendResponse(res, 200, true, 'Lab test retrieved successfully', labTest);
});

/**
 * @desc    Update lab test result (after 2 days from scheduled date)
 * @route   PATCH /api/admin/lab-tests/:id/result
 * @access  Private (Admin)
 */
exports.updateLabTestResult = catchAsync(async (req, res) => {
  const { testResults, results, resultSummary, reportFile, reportUrl, remarks, testedBy, verifiedBy } = req.body;

  // Find lab test
  const labTest = await LabTest.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });

  if (!labTest) {
    throw new AppError('Lab test not found', 404);
  }

  // Removed the 2-day delay restriction to allow immediate report entry/upload.

  // Use testResults if provided, otherwise use results
  const finalResults = testResults || results || [];

  // Transform testResults to match the schema format if needed
  const transformedResults = finalResults.map(result => ({
    parameter: result.parameter,
    value: result.value,
    unit: result.unit || '',
    normalRange: result.referenceRange || result.normalRange || '',
    status: result.status || 'normal',
    notes: result.notes || ''
  }));

  // Update lab test with results
  labTest.results = transformedResults;
  labTest.resultSummary = resultSummary || {};
  labTest.status = 'report_ready';
  labTest.remarks = remarks || labTest.remarks;

  const finalReportUrl = reportFile || reportUrl;
  if (finalReportUrl) {
    labTest.report = {
      url: finalReportUrl,
      uploadedAt: new Date(),
      generatedAt: new Date()
    };
  }

  if (testedBy) {
    labTest.testedBy = testedBy;
  }

  if (verifiedBy) {
    labTest.verifiedBy = {
      ...verifiedBy,
      verifiedAt: new Date()
    };
  }

  await labTest.save();

  // Create notification for patient
  if (labTest.patient && labTest.patient.user) {
    await Notification.create({
      recipient: labTest.patient.user._id,
      type: 'lab_test_result',
      title: 'Lab Test Results Ready',
      message: `Your ${labTest.testName} results are now available. Please check your lab tests section for detailed report.`,
      priority: 'high',
      category: 'info',
      relatedEntity: {
        entityType: 'labtest',
        entityId: labTest._id
      }
    });
  }

  return sendResponse(res, 200, true, 'Lab test results updated successfully and patient notified', labTest);
});

/**
 * @desc    Update lab test status
 * @route   PATCH /api/admin/lab-tests/:id/status
 * @access  Private (Admin)
 */
exports.updateLabTestStatus = catchAsync(async (req, res) => {
  const { status, sampleCollection } = req.body;

  const validStatuses = ['booked', 'sample_collected', 'processing', 'completed', 'cancelled', 'report_ready'];

  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const labTest = await LabTest.findById(req.params.id);

  if (!labTest) {
    throw new AppError('Lab test not found', 404);
  }

  labTest.status = status;

  if (status === 'sample_collected' && sampleCollection) {
    labTest.sampleCollection = {
      ...sampleCollection,
      collectedAt: new Date()
    };
  }

  await labTest.save();

  return sendResponse(res, 200, true, 'Lab test status updated successfully', labTest);
});

module.exports = exports;
