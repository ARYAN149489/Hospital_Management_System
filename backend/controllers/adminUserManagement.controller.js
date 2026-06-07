// backend/controllers/adminUserManagement.controller.js
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Admin = require('../models/Admin.model');
const Leave = require('../models/Leave.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const leaveService = require('../services/leave.service');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/responseHandler');
const emailService = require('../utils/emailService');
const Notification = require('../models/Notification.model');

exports.getAllUsers = catchAsync(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  return res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: users
  });
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id }).populate('department');
  } else if (user.role === 'admin') {
    profile = await Admin.findOne({ user: user._id });
  }

  return sendResponse(res, 200, true, 'User retrieved successfully', { user, profile });
});

exports.updateUserStatus = catchAsync(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true, runValidators: true });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sendResponse(res, 200, true, 'User status updated successfully', user);
});

exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'patient') {
    await Patient.deleteOne({ user: user._id });
  } else if (user.role === 'doctor') {
    await Doctor.deleteOne({ user: user._id });
  } else if (user.role === 'admin') {
    await Admin.deleteOne({ user: user._id });
  }

  await user.deleteOne();
  return sendResponse(res, 200, true, 'User and associated profile deleted successfully');
});

exports.getAllDoctors = catchAsync(async (req, res) => {
  const { status, department, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) {
    query.approvalStatus = status === 'active' ? 'approved' : status;
  }

  if (department) {
    query.department = department;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let allDocs = await Doctor.find(query)
    .populate('user', 'firstName lastName email phone isActive')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  if (search) {
    const searchLower = search.toLowerCase();
    allDocs = allDocs.filter(doc => {
      const fullName = `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.toLowerCase();
      const email = (doc.user?.email || '').toLowerCase();
      const specialization = (doc.specialization || '').toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower) || specialization.includes(searchLower);
    });
  }

  const total = allDocs.length;
  const paginatedDocs = allDocs.slice(skip, skip + parseInt(limit));

  return res.status(200).json({
    success: true,
    count: paginatedDocs.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: paginatedDocs
  });
});

exports.createDoctor = catchAsync(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    specialization,
    department,
    medicalLicenseNumber,
    medicalCouncilRegistration,
    licenseValidUntil,
    yearsOfExperience,
    consultationFee,
    qualifications,
    languages
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    gender,
    dateOfBirth: dateOfBirth || new Date(1980, 0, 1),
    role: 'doctor',
    isEmailVerified: true
  });

  const doctor = await Doctor.create({
    user: user._id,
    specialization,
    department,
    medicalLicenseNumber,
    medicalCouncilRegistration,
    licenseValidUntil,
    yearsOfExperience,
    consultationFee,
    qualifications,
    languages: languages || ['english'],
    approvalStatus: 'approved' // Created directly by Admin, auto-approved
  });

  return sendResponse(res, 201, true, 'Doctor created successfully', doctor);
});

exports.updateDoctorApproval = catchAsync(async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!['active', 'rejected'].includes(status)) {
    throw new AppError('Invalid status. Must be "active" or "rejected"', 400);
  }

  const doctor = await Doctor.findById(req.params.id).populate('user');
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  if (doctor.approvalStatus !== 'pending') {
    throw new AppError('Doctor approval status has already been processed', 400);
  }

  const admin = await Admin.findOne({ user: req.userId });
  if (!admin) {
    throw new AppError('Admin profile not found', 404);
  }

  doctor.approvalStatus = status === 'active' ? 'approved' : 'rejected';
  if (status === 'active') {
    doctor.approvedBy = admin._id;
    doctor.approvalDate = new Date();
  } else if (status === 'rejected' && rejectionReason) {
    doctor.rejectionReason = rejectionReason;
  }
  await doctor.save();

  // Notify
  if (doctor.user) {
    await Notification.create({
      recipient: doctor.user._id,
      title: status === 'active' ? 'Profile Approved' : 'Profile Rejected',
      message: status === 'active' ? 'Your professional doctor profile has been approved.' : `Your profile was rejected. Reason: ${rejectionReason}`,
      type: status === 'active' ? 'doctor_approved' : 'doctor_rejected',
      priority: 'high',
      category: status === 'active' ? 'success' : 'error'
    });

    try {
      if (status === 'active') {
        await emailService.sendWelcomeEmail(doctor.user);
      }
    } catch (err) {
      console.error('Welcome email error:', err.message);
    }
  }

  return sendResponse(res, 200, true, 'Doctor status updated successfully', doctor);
});

exports.suspendDoctor = catchAsync(async (req, res) => {
  const { suspended, suspensionReason } = req.body;
  const doctor = await Doctor.findById(req.params.id).populate('user');
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  doctor.approvalStatus = suspended ? 'suspended' : 'approved';
  if (suspended) {
    doctor.rejectionReason = suspensionReason || 'Suspended by admin';
  }
  await doctor.save();

  return sendResponse(res, 200, true, 'Doctor suspension updated successfully', doctor);
});

exports.blockDoctor = catchAsync(async (req, res) => {
  const { blockReason, reason } = req.body;
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  doctor.isBlocked = true;
  doctor.blockedAt = new Date();
  doctor.blockReason = blockReason || reason || 'Blocked by admin';
  await doctor.save();

  return sendResponse(res, 200, true, 'Doctor blocked successfully', doctor);
});

exports.unblockDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  doctor.isBlocked = false;
  doctor.blockedAt = null;
  doctor.blockReason = null;
  await doctor.save();

  return sendResponse(res, 200, true, 'Doctor unblocked successfully', doctor);
});

exports.getAllLeaves = catchAsync(async (req, res) => {
  const { status, doctorId, page = 1, limit = 20 } = req.query;
  const query = {};

  if (status) query.status = status;
  if (doctorId) query.doctor = doctorId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const leaves = await Leave.find(query)
    .populate({
      path: 'doctor',
      select: 'specialization user',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate('substituteDoctor', 'name specialization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Leave.countDocuments(query);

  return res.status(200).json({
    success: true,
    count: leaves.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: leaves
  });
});

exports.updateLeaveApproval = catchAsync(async (req, res) => {
  const leave = await leaveService.updateLeaveApproval(req.params.id, req.userId, req.body);
  return sendResponse(res, 200, true, 'Leave request processed successfully', leave);
});

exports.getAllPatients = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let allPatients = await Patient.find()
    .populate('user', 'firstName lastName email phone isActive dateOfBirth gender address')
    .sort({ createdAt: -1 });

  if (search) {
    const searchLower = search.toLowerCase();
    allPatients = allPatients.filter(pat => {
      const fullName = `${pat.user?.firstName || ''} ${pat.user?.lastName || ''}`.toLowerCase();
      const email = (pat.user?.email || '').toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    });
  }

  const total = allPatients.length;
  const paginatedPatients = allPatients.slice(skip, skip + parseInt(limit));

  return res.status(200).json({
    success: true,
    count: paginatedPatients.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: paginatedPatients
  });
});

exports.getPatientById = catchAsync(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user', '-password -refreshToken');
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  return sendResponse(res, 200, true, 'Patient retrieved successfully', patient);
});

exports.deletePatient = catchAsync(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (patient.user) {
    await User.deleteOne({ _id: patient.user });
  }
  await patient.deleteOne();

  return sendResponse(res, 200, true, 'Patient profile and account deleted successfully');
});

exports.getPatientAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.params.id })
    .populate({
      path: 'doctor',
      select: 'specialization',
      populate: { path: 'user', select: 'firstName lastName email' }
    })
    .sort({ appointmentDate: -1 });

  return sendResponse(res, 200, true, 'Patient appointments retrieved', appointments);
});

exports.getPatientPrescriptions = catchAsync(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.params.id })
    .populate({
      path: 'doctor',
      select: 'specialization',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ prescriptionDate: -1 });

  return sendResponse(res, 200, true, 'Patient prescriptions retrieved', prescriptions);
});

exports.deleteDoctor = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  if (doctor.user) {
    await User.deleteOne({ _id: doctor.user });
  }
  await doctor.deleteOne();

  return sendResponse(res, 200, true, 'Doctor profile and account deleted successfully');
});