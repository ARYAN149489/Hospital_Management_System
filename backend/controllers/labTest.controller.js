// backend/controllers/labTest.controller.js
const LabTest = require('../models/LabTest.model');
const Patient = require('../models/Patient.model');
const Notification = require('../models/Notification.model');
const { generateLabTestId } = require('../utils/helpers');

/**
 * @desc    Book a new lab test
 * @route   POST /api/patient/lab-tests/book
 * @access  Private (Patient)
 */
exports.bookLabTest = async (req, res) => {
  try {
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

    // Validate required fields (labName, labAddress, labPhone are now optional)
    if (!testName || !testCategory || !scheduledDate || !scheduledTime || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate time slot is between 9 AM and 5 PM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format'
      });
    }
    
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    if (hours < 9 || hours >= 17) {
      return res.status(400).json({
        success: false,
        message: 'Lab test bookings are only available between 9 AM and 5 PM'
      });
    }

    // Validate scheduled date is not in past
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (scheduled < today) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date cannot be in the past'
      });
    }

    // Find patient
    const patient = await Patient.findOne({ user: req.userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
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

    res.status(201).json({
      success: true,
      message: 'Lab test booked successfully',
      data: labTest
    });
  } catch (error) {
    console.error('❌ Book lab test error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book lab test',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all lab tests for admin
 * @route   GET /api/admin/lab-tests
 * @access  Private (Admin)
 */
exports.getAllLabTests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by test name, lab test ID, or patient name
    if (search) {
      // We'll handle patient name search after population
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

    res.status(200).json({
      success: true,
      count: labTests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: labTests
    });
  } catch (error) {
    console.error('Get all lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get lab test by ID (for admin)
 * @route   GET /api/admin/lab-tests/:id
 * @access  Private (Admin)
 */
exports.getLabTestById = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: labTest
    });
  } catch (error) {
    console.error('Get lab test by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update lab test result (after 2 days from scheduled date)
 * @route   PATCH /api/admin/lab-tests/:id/result
 * @access  Private (Admin)
 */
exports.updateLabTestResult = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Check if lab test is at least 2 days old from scheduled date
    const scheduledDate = new Date(labTest.scheduledDate);
    const today = new Date();
    scheduledDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysDifference = Math.floor((today - scheduledDate) / (1000 * 60 * 60 * 24));

    if (daysDifference < 2) {
      return res.status(400).json({
        success: false,
        message: `Results can only be updated after 2 days from the scheduled date. ${2 - daysDifference} day(s) remaining.`
      });
    }

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

    res.status(200).json({
      success: true,
      message: 'Lab test results updated successfully and patient notified',
      data: labTest
    });
  } catch (error) {
    console.error('Update lab test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lab test results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update lab test status
 * @route   PATCH /api/admin/lab-tests/:id/status
 * @access  Private (Admin)
 */
exports.updateLabTestStatus = async (req, res) => {
  try {
    const { status, sampleCollection } = req.body;

    const validStatuses = ['booked', 'sample_collected', 'processing', 'completed', 'cancelled', 'report_ready'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    labTest.status = status;

    if (status === 'sample_collected' && sampleCollection) {
      labTest.sampleCollection = {
        ...sampleCollection,
        collectedAt: new Date()
      };
    }

    await labTest.save();

    res.status(200).json({
      success: true,
      message: 'Lab test status updated successfully',
      data: labTest
    });
  } catch (error) {
    console.error('Update lab test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lab test status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;
