// backend/controllers/leave.controller.js
const Leave = require('../models/Leave.model');
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
const Notification = require('../models/Notification.model');
const emailService = require('../utils/emailService');

/**
 * @desc    Create leave request
 * @route   POST /api/leaves
 * @access  Private (Doctor)
 */
exports.createLeaveRequest = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      halfDayType,
      reason,
      substituteDoctor,
      contactDuringLeave,
      totalDays
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Calculate total days if not provided
    let calculatedTotalDays = totalDays;
    if (!calculatedTotalDays) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedTotalDays = isHalfDay ? 0.5 : diffDays;
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      doctor: doctor._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for this period'
      });
    }

    // Generate leave ID
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await Leave.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    const leaveId = `LV${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Get affected appointments
    const affectedAppointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed', 'scheduled'] }
    }).populate('patient', 'name phone email');

    // Create leave request
    const leave = await Leave.create({
      leaveId,
      doctor: doctor._id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays: calculatedTotalDays,
      isHalfDay,
      halfDayType,
      reason,
      substituteDoctor,
      contactDuringLeave,
      affectedAppointments: affectedAppointments.map(apt => apt._id)
    });

    // Populate leave
    await leave.populate([
      { path: 'doctor', select: 'name specialization' },
      { path: 'substituteDoctor', select: 'name specialization' }
    ]);

    // Create notification for admin (you'll need to get admin users)
    // For now, we'll skip this and implement in admin controller

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        leave,
        affectedAppointmentsCount: affectedAppointments.length
      }
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's leave requests
 * @route   GET /api/leaves/my-leaves
 * @access  Private (Doctor)
 */
exports.getMyLeaves = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
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

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: leaves
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get leave request by ID
 * @route   GET /api/leaves/:id
 * @access  Private
 */
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('doctor', 'name specialization phone email')
      .populate('substituteDoctor', 'name specialization')
      .populate('approvedBy', 'firstName lastName email')
      .populate('affectedAppointments');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check access rights
    const doctor = await Doctor.findOne({ user: req.userId });
    const isOwnLeave = doctor && leave.doctor._id.equals(doctor._id);
    const isAdmin = req.userRole === 'admin';

    if (!isOwnLeave && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update leave request
 * @route   PUT /api/leaves/:id
 * @access  Private (Doctor)
 */
exports.updateLeaveRequest = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Verify doctor owns this leave
    if (!leave.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own leave requests'
      });
    }

    // Can only update pending leaves
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending leave requests'
      });
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

    res.status(200).json({
      success: true,
      message: 'Leave request updated successfully',
      data: updatedLeave
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel leave request
 * @route   DELETE /api/leaves/:id
 * @access  Private (Doctor)
 */
exports.cancelLeaveRequest = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Verify doctor owns this leave
    if (!leave.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests'
      });
    }

    // Can only cancel pending or approved leaves
    if (!['pending', 'approved'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this leave request'
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get leave statistics for doctor
 * @route   GET /api/leaves/statistics
 * @access  Private (Doctor)
 */
exports.getLeaveStatistics = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get current year statistics
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

    // Calculate total days taken
    const approvedLeavesList = await Leave.find({
      doctor: doctor._id,
      status: 'approved',
      startDate: { $gte: yearStart, $lte: yearEnd }
    });

    let totalDaysTaken = 0;
    approvedLeavesList.forEach(leave => {
      totalDaysTaken += leave.totalDays;
    });

    res.status(200).json({
      success: true,
      data: {
        year: currentYear,
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        totalDaysTaken
      }
    });
  } catch (error) {
    console.error('Get leave statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;