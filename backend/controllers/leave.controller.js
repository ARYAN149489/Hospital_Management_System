// backend/controllers/leave.controller.js
const catchAsync = require('../utils/catchAsync');
const leaveService = require('../services/leave.service');
const Leave = require('../models/Leave.model');
const Doctor = require('../models/Doctor.model');
const { sendResponse } = require('../utils/responseHandler');

exports.createLeaveRequest = catchAsync(async (req, res) => {
  const result = await leaveService.applyLeave(req.userId, req.body);
  return sendResponse(res, 201, true, 'Leave request submitted successfully', result);
});

exports.getMyLeaves = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor profile not found');
  }

  const { status, page = 1, limit = 10 } = req.query;
  const query = { doctor: doctor._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const leaves = await Leave.find(query)
    .populate('substituteDoctor', 'name specialization')
    .populate('approvedBy', 'firstName lastName')
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

exports.getLeaveById = catchAsync(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('doctor', 'name specialization phone email')
    .populate('substituteDoctor', 'name specialization')
    .populate('approvedBy', 'firstName lastName email')
    .populate('affectedAppointments');

  if (!leave) {
    return sendResponse(res, 404, false, 'Leave request not found');
  }

  const doctor = await Doctor.findOne({ user: req.userId });
  const isOwnLeave = doctor && leave.doctor && leave.doctor._id.equals(doctor._id);
  const isAdmin = req.userRole === 'admin';

  if (!isOwnLeave && !isAdmin) {
    return sendResponse(res, 403, false, 'Access denied');
  }

  return sendResponse(res, 200, true, 'Leave retrieved successfully', leave);
});

exports.updateLeaveRequest = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor profile not found');
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return sendResponse(res, 404, false, 'Leave request not found');
  }

  if (!leave.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'You can only update your own leave requests');
  }

  if (leave.status !== 'pending') {
    return sendResponse(res, 400, false, 'Can only update pending leave requests');
  }

  const allowedUpdates = [
    'leaveType',
    'startDate',
    'endDate',
    'isHalfDay',
    'halfDayPeriod',
    'reason',
    'substituteDoctor',
    'contactDuringLeave'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedLeave = await Leave.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate([
    { path: 'doctor', select: 'name specialization' },
    { path: 'substituteDoctor', select: 'name specialization' }
  ]);

  return sendResponse(res, 200, true, 'Leave request updated successfully', updatedLeave);
});

exports.cancelLeaveRequest = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor profile not found');
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return sendResponse(res, 404, false, 'Leave request not found');
  }

  if (!leave.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'You can only cancel your own leave requests');
  }

  if (!['pending', 'approved'].includes(leave.status)) {
    return sendResponse(res, 400, false, 'Cannot cancel this leave request');
  }

  leave.status = 'cancelled';
  await leave.save();

  return sendResponse(res, 200, true, 'Leave request cancelled successfully', leave);
});

exports.getLeaveStatistics = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor profile not found');
  }

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31);

  const totalLeaves = await Leave.countDocuments({
    doctor: doctor._id,
    startDate: { $gte: yearStart, $lte: yearEnd }
  });

  const approvedLeaves = await Leave.countDocuments({
    doctor: doctor._id,
    status: 'approved',
    startDate: { $gte: yearStart, $lte: yearEnd }
  });

  const pendingLeaves = await Leave.countDocuments({
    doctor: doctor._id,
    status: 'pending'
  });

  const rejectedLeaves = await Leave.countDocuments({
    doctor: doctor._id,
    status: 'rejected',
    startDate: { $gte: yearStart, $lte: yearEnd }
  });

  const approvedLeavesList = await Leave.find({
    doctor: doctor._id,
    status: 'approved',
    startDate: { $gte: yearStart, $lte: yearEnd }
  });

  let totalDaysTaken = 0;
  approvedLeavesList.forEach(leave => {
    totalDaysTaken += leave.totalDays || 0;
  });

  return sendResponse(res, 200, true, 'Leave statistics retrieved successfully', {
    year: currentYear,
    totalLeaves,
    approvedLeaves,
    pendingLeaves,
    rejectedLeaves,
    totalDaysTaken
  });
});