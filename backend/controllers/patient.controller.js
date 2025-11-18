// backend/controllers/patient.controller.js
const Patient = require('../models/Patient.model');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const MedicalRecord = require('../models/MedicalRecord.model');
const LabTest = require('../models/LabTest.model');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');

/**
 * @desc    Get patient profile
 * @route   GET /api/patients/profile
 * @access  Private (Patient)
 */
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId })
      .populate('user', '-password -refreshToken');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patients/profile
 * @access  Private (Patient)
 */
exports.updateProfile = async (req, res) => {
  try {
    // Separate user fields from patient fields
    const userFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'];
    const patientFields = ['bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact', 'insuranceDetails'];

    const userUpdates = {};
    const patientUpdates = {};

    Object.keys(req.body).forEach(key => {
      if (userFields.includes(key)) {
        userUpdates[key] = req.body[key];
      } else if (patientFields.includes(key)) {
        patientUpdates[key] = req.body[key];
      }
    });

    // Update User model
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.userId,
        userUpdates,
        { new: true, runValidators: true }
      );
    }

    // Update Patient model
    let patient;
    if (Object.keys(patientUpdates).length > 0) {
      patient = await Patient.findOneAndUpdate(
        { user: req.userId },
        patientUpdates,
        { new: true, runValidators: true }
      ).populate('user', '-password -refreshToken');
    } else {
      patient = await Patient.findOne({ user: req.userId })
        .populate('user', '-password -refreshToken');
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get updated user data
    const updatedUser = await User.findById(req.userId).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser.toObject(),
        patient: patient
      }
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient dashboard statistics
 * @route   GET /api/patients/dashboard
 * @access  Private (Patient)
 */
exports.getDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get upcoming appointments (TODAY ONLY)
    let upcomingAppointments = [];
    try {
      // Get start and end of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      upcomingAppointments = await Appointment.find({
        patient: patient._id,
        appointmentDate: { 
          $gte: todayStart,
          $lte: todayEnd
        },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate({
          path: 'doctor',
          select: 'specialization consultationFee',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .sort({ appointmentDate: 1 })
        .limit(5);

      // Update expired appointments automatically
      upcomingAppointments = await updateExpiredAppointments(upcomingAppointments);

      // Filter out appointments that are no longer scheduled or confirmed
      upcomingAppointments = upcomingAppointments.filter(apt => 
        apt.status === 'scheduled' || apt.status === 'confirmed'
      );
    } catch (appointmentError) {
      console.error('Error fetching appointments:', appointmentError);
      // Continue with empty array
    }

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({
      patient: patient._id
    });

    // Get completed appointments
    const completedAppointments = await Appointment.countDocuments({
      patient: patient._id,
      status: 'completed'
    });

    // Get recent prescriptions
    let recentPrescriptions = [];
    try {
      recentPrescriptions = await Prescription.find({
        patient: patient._id
      })
        .populate({
          path: 'doctor',
          select: 'specialization',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .sort({ prescriptionDate: -1 })
        .limit(5);
    } catch (prescriptionError) {
      console.error('Error fetching prescriptions:', prescriptionError);
      // Continue with empty array
    }

    // Get pending lab tests
    let pendingLabTests = [];
    try {
      pendingLabTests = await LabTest.find({
        patient: patient._id,
        testStatus: { $in: ['booked', 'sample_collected', 'processing'] }
      })
        .populate({
          path: 'prescribedBy',
          select: 'specialization',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .sort({ createdAt: -1 });
    } catch (labTestError) {
      // Continue with empty array if lab tests fail
    }

    // Get recent medical records
    let recentRecords = [];
    try {
      recentRecords = await MedicalRecord.find({
        patient: patient._id
      })
        .sort({ createdAt: -1 })
        .limit(5);
    } catch (recordError) {
      console.error('Error fetching medical records:', recordError);
      // Continue with empty array
    }

    // Transform appointments to include doctor name
    const transformedAppointments = upcomingAppointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.doctor && aptObj.doctor.user) {
        aptObj.doctor.name = `${aptObj.doctor.user.firstName} ${aptObj.doctor.user.lastName}`;
      }
      return aptObj;
    });

    // Transform prescriptions to include doctor name
    const transformedPrescriptions = recentPrescriptions.map(presc => {
      const prescObj = presc.toObject();
      if (prescObj.doctor && prescObj.doctor.user) {
        prescObj.doctor.name = `${prescObj.doctor.user.firstName} ${prescObj.doctor.user.lastName}`;
      }
      return prescObj;
    });

    // Transform lab tests to include doctor name
    const transformedLabTests = pendingLabTests.map(test => {
      const testObj = test.toObject();
      if (testObj.prescribedBy && testObj.prescribedBy.user) {
        testObj.doctor = {
          name: `${testObj.prescribedBy.user.firstName} ${testObj.prescribedBy.user.lastName}`,
          specialization: testObj.prescribedBy.specialization
        };
      }
      return testObj;
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalAppointments,
          completedAppointments,
          upcomingAppointmentsCount: transformedAppointments.length,
          pendingLabTestsCount: transformedLabTests.length,
          prescriptionsCount: transformedPrescriptions.length
        },
        upcomingAppointments: transformedAppointments,
        recentPrescriptions: transformedPrescriptions,
        pendingLabTests: transformedLabTests,
        recentRecords
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient's medical records
 * @route   GET /api/patients/medical-records
 * @access  Private (Patient)
 */
exports.getMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { type, startDate, endDate } = req.query;

    const query = { patient: patient._id };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const records = await MedicalRecord.find(query)
      .populate({
        path: 'doctor',
        select: 'specialization',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedRecords = records.map(record => {
      const obj = record.toObject();
      
      // Map recordType to category
      obj.category = obj.recordType;
      
      // Map recordDate to date
      obj.date = obj.recordDate;
      
      // Convert single file to files array
      if (obj.file) {
        obj.files = [obj.file];
      } else {
        obj.files = [];
      }
      
      // Add doctor name if populated
      if (obj.doctor && obj.doctor.user) {
        obj.doctor.name = `${obj.doctor.user.firstName} ${obj.doctor.user.lastName}`;
      }
      
      return obj;
    });

    res.status(200).json({
      success: true,
      count: transformedRecords.length,
      data: transformedRecords
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medical records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Upload medical record
 * @route   POST /api/patients/medical-records
 * @access  Private (Patient)
 */
exports.uploadMedicalRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { type, title, description, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const record = await MedicalRecord.create({
      patient: patient._id,
      type,
      title,
      description,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.userId,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      data: record
    });
  } catch (error) {
    console.error('Upload medical record error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to upload medical record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient's prescriptions
 * @route   GET /api/patients/prescriptions
 * @access  Private (Patient)
 */
exports.getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const prescriptions = await Prescription.find({
      patient: patient._id
    })
      .populate({
        path: 'patient',
        select: 'bloodGroup',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone dateOfBirth gender'
        }
      })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee medicalLicenseNumber licenseNumber',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate('appointment', 'appointmentDate appointmentTime appointmentType')
      .sort({ prescriptionDate: -1 });

    // Transform the data to include doctor name and patient name
    const transformedPrescriptions = prescriptions.map(prescription => {
      const prescriptionObj = prescription.toObject();
      if (prescriptionObj.doctor && prescriptionObj.doctor.user) {
        prescriptionObj.doctor.name = `${prescriptionObj.doctor.user.firstName} ${prescriptionObj.doctor.user.lastName}`;
      }
      if (prescriptionObj.patient && prescriptionObj.patient.user) {
        prescriptionObj.patient.name = `${prescriptionObj.patient.user.firstName} ${prescriptionObj.patient.user.lastName}`;
      }
      return prescriptionObj;
    });

    res.status(200).json({
      success: true,
      count: transformedPrescriptions.length,
      data: transformedPrescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient's lab tests
 * @route   GET /api/patients/lab-tests
 * @access  Private (Patient)
 */
exports.getLabTests = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { status } = req.query;
    const query = { patient: patient._id };

    if (status) {
      query.status = status;
    }

    const labTests = await LabTest.find(query)
      .populate({
        path: 'prescribedBy',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort({ createdAt: -1 });

    // Transform the data to include doctor name
    const transformedLabTests = labTests.map(labTest => {
      const labTestObj = labTest.toObject();
      if (labTestObj.prescribedBy && labTestObj.prescribedBy.user) {
        labTestObj.doctor = {
          name: `${labTestObj.prescribedBy.user.firstName} ${labTestObj.prescribedBy.user.lastName}`,
          specialization: labTestObj.prescribedBy.specialization
        };
      }
      return labTestObj;
    });

    res.status(200).json({
      success: true,
      count: transformedLabTests.length,
      data: transformedLabTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get lab tests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient's appointment history
 * @route   GET /api/patients/appointments/history
 * @access  Private (Patient)
 */
exports.getAppointmentHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let appointments = await Appointment.find({
      patient: patient._id
    })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('department', 'name')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    // Update expired appointments automatically
    appointments = await updateExpiredAppointments(appointments);

    const total = await Appointment.countDocuments({ patient: patient._id });

    // Transform appointments to include doctor name
    const transformedAppointments = appointments.map(apt => {
      const aptObj = apt.toObject();
      if (aptObj.doctor && aptObj.doctor.user) {
        aptObj.doctor.name = `${aptObj.doctor.user.firstName} ${aptObj.doctor.user.lastName}`;
      }
      return aptObj;
    });

    res.status(200).json({
      success: true,
      count: transformedAppointments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transformedAppointments
    });
  } catch (error) {
    console.error('Get appointment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;