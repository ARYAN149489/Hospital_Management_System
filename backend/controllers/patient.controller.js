// backend/controllers/patient.controller.js
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const Patient = require('../models/Patient.model');
const User = require('../models/User.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const MedicalRecord = require('../models/MedicalRecord.model');
const LabTest = require('../models/LabTest.model');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');
const { sendResponse } = require('../utils/responseHandler');

exports.getProfile = catchAsync(async (req, res) => {
  const patient = await userService.getPatientProfile(req.userId);
  return sendResponse(res, 200, true, 'Patient profile retrieved', patient);
});

exports.updateProfile = catchAsync(async (req, res) => {
  const patient = await userService.updatePatientProfile(req.userId, req.body);
  return sendResponse(res, 200, true, 'Profile updated successfully', patient);
});

exports.getDashboard = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
  }

  // Get upcoming appointments (TODAY ONLY)
  let upcomingAppointments = [];
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    upcomingAppointments = await Appointment.find({
      patient: patient._id,
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ appointmentDate: 1 })
      .limit(5);

    upcomingAppointments = await updateExpiredAppointments(upcomingAppointments);
    upcomingAppointments = upcomingAppointments.filter(apt =>
      apt.status === 'scheduled' || apt.status === 'confirmed'
    );
  } catch (err) {
    console.error('Error fetching appointments for dashboard:', err);
  }

  const totalAppointments = await Appointment.countDocuments({ patient: patient._id });
  const completedAppointments = await Appointment.countDocuments({
    patient: patient._id,
    status: 'completed'
  });

  let recentPrescriptions = [];
  try {
    recentPrescriptions = await Prescription.find({ patient: patient._id })
      .populate({
        path: 'doctor',
        select: 'specialization',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ prescriptionDate: -1 })
      .limit(5);
  } catch (err) {
    console.error('Error fetching prescriptions for dashboard:', err);
  }

  let pendingLabTests = [];
  try {
    pendingLabTests = await LabTest.find({
      patient: patient._id,
      status: { $in: ['booked', 'sample_collected', 'processing'] }
    })
      .populate({
        path: 'prescribedBy',
        select: 'specialization',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching lab tests for dashboard:', err);
  }

  let recentRecords = [];
  try {
    recentRecords = await MedicalRecord.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(5);
  } catch (err) {
    console.error('Error fetching medical records for dashboard:', err);
  }

  const transformedAppointments = upcomingAppointments.map(apt => {
    const aptObj = apt.toObject();
    if (aptObj.doctor && aptObj.doctor.user) {
      aptObj.doctor.name = `${aptObj.doctor.user.firstName} ${aptObj.doctor.user.lastName}`;
    }
    return aptObj;
  });

  const transformedPrescriptions = recentPrescriptions.map(presc => {
    const prescObj = presc.toObject();
    if (prescObj.doctor && prescObj.doctor.user) {
      prescObj.doctor.name = `${prescObj.doctor.user.firstName} ${prescObj.doctor.user.lastName}`;
    }
    return prescObj;
  });

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

  return sendResponse(res, 200, true, 'Dashboard retrieved successfully', {
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
  });
});

exports.getMedicalRecords = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
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
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 });

  const transformedRecords = records.map(record => {
    const obj = record.toObject();
    obj.category = obj.recordType;
    obj.date = obj.recordDate;
    obj.files = obj.file ? [obj.file] : [];
    if (obj.doctor && obj.doctor.user) {
      obj.doctor.name = `${obj.doctor.user.firstName} ${obj.doctor.user.lastName}`;
    }
    return obj;
  });

  return sendResponse(res, 200, true, 'Medical records retrieved', transformedRecords);
});

exports.uploadMedicalRecord = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
  }

  const { type, title, description, tags } = req.body;
  if (!req.file) {
    return sendResponse(res, 400, false, 'Please upload a file');
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

  return sendResponse(res, 201, true, 'Medical record uploaded successfully', record);
});

exports.getPrescriptions = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
  }

  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({
      path: 'patient',
      select: 'bloodGroup',
      populate: { path: 'user', select: 'firstName lastName email phone dateOfBirth gender' }
    })
    .populate({
      path: 'doctor',
      select: 'specialization consultationFee medicalLicenseNumber licenseNumber',
      populate: { path: 'user', select: 'firstName lastName email' }
    })
    .populate('appointment', 'appointmentDate appointmentTime appointmentType')
    .sort({ prescriptionDate: -1 });

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

  return sendResponse(res, 200, true, 'Prescriptions retrieved successfully', transformedPrescriptions);
});

exports.getLabTests = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
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
      populate: { path: 'user', select: 'firstName lastName email' }
    })
    .sort({ createdAt: -1 });

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

  return sendResponse(res, 200, true, 'Lab tests retrieved successfully', transformedLabTests);
});

exports.getAppointmentHistory = catchAsync(async (req, res) => {
  const patient = await Patient.findOne({ user: req.userId });
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let appointments = await Appointment.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      select: 'specialization consultationFee',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('department', 'name')
    .sort({ appointmentDate: -1 })
    .skip(skip)
    .limit(limit);

  appointments = await updateExpiredAppointments(appointments);
  const total = await Appointment.countDocuments({ patient: patient._id });

  const transformedAppointments = appointments.map(apt => {
    const aptObj = apt.toObject();
    if (aptObj.doctor && aptObj.doctor.user) {
      aptObj.doctor.name = `${aptObj.doctor.user.firstName} ${aptObj.doctor.user.lastName}`;
    }
    return aptObj;
  });

  return res.status(200).json({
    success: true,
    count: transformedAppointments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transformedAppointments
  });
});