// backend/controllers/adminUserManagement.controller.js
const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Admin = require('../models/Admin.model');
const Leave = require('../models/Leave.model');
const Notification = require('../models/Notification.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const emailService = require('../utils/emailService');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'admin') {
      roleData = await Admin.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        roleData
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity (optional - admin might not have Admin document)
    try {
      const admin = await Admin.findOne({ user: req.userId });
      if (admin) {
        admin.activityLog.unshift({
          action: isActive ? 'activated_user' : 'deactivated_user',
          description: `${isActive ? 'Activated' : 'Deactivated'} user ${user.email}`,
          targetModel: 'User',
          targetId: user._id,
          timestamp: new Date()
        });
        await admin.save();
      }
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Don't fail the request if logging fails
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete role-specific data
    if (user.role === 'patient') {
      await Patient.findOneAndDelete({ user: user._id });
    } else if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    } else if (user.role === 'admin') {
      await Admin.findOneAndDelete({ user: user._id });
    }

    await user.deleteOne();

    // Log activity
    const admin = await Admin.findOne({ user: req.userId });
    admin.activityLog.unshift({
      action: 'deleted_user',
      description: `Deleted user ${user.email}`,
      targetModel: 'User',
      targetId: user._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all doctors (admin view)
 * @route   GET /api/admin/doctors
 * @access  Private (Admin)
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    // Build search query - search in populated user fields
    let doctors;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (search) {
      // First get all doctors with populated user data
      const allDoctors = await Doctor.find(query)
        .populate('user', 'firstName lastName email phone isActive')
        .populate('department', 'name code')
        .lean() // Use lean() to get plain JavaScript objects
        .sort({ createdAt: -1 });

      // Filter by search term
      doctors = allDoctors.filter(doctor => {
        const searchLower = search.toLowerCase();
        const fullName = `${doctor.user?.firstName || ''} ${doctor.user?.lastName || ''}`.toLowerCase();
        const email = (doctor.user?.email || '').toLowerCase();
        const specialization = (doctor.specialization || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               specialization.includes(searchLower);
      });

      // Apply pagination to filtered results
      const total = doctors.length;
      doctors = doctors.slice(skip, skip + parseInt(limit));

      return res.status(200).json({
        success: true,
        count: doctors.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: doctors
      });
    }

    doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email phone isActive')
      .populate('department', 'name code')
      .lean() // Use lean() to get plain JavaScript objects
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: doctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create a new doctor (admin creates directly)
 * @route   POST /api/admin/doctors/create
 * @access  Private (Admin)
 */
exports.createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      specialization,
      medicalLicenseNumber,
      yearsOfExperience,
      consultationFee,
      qualifications,
      bio
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if medical license already exists
    const existingLicense = await Doctor.findOne({ medicalLicenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Medical license number already registered'
      });
    }

    // Create user account
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      dateOfBirth: new Date('1980-01-01'), // Default DOB
      role: 'doctor',
      isEmailVerified: true, // Admin-created accounts are pre-verified
      isActive: true
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualifications,
      medicalLicenseNumber,
      yearsOfExperience,
      consultationFee,
      consultationDuration: 30,
      bio,
      availability: [
        { day: 'monday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { day: 'tuesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { day: 'wednesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { day: 'thursday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { day: 'friday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
        { day: 'saturday', slots: [{ startTime: '09:00', endTime: '13:00' }] }
      ],
      isAvailable: true,
      isVerified: true, // Admin-created doctors are pre-verified
      approvalStatus: 'approved' // No approval needed for admin-created doctors
    });

    // Populate the doctor with user data
    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'firstName lastName email phone gender');

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: populatedDoctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Approve or reject doctor
 * @route   PATCH /api/admin/doctors/:id/approval
 * @access  Private (Admin)
 */
exports.updateDoctorApproval = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "rejected"'
      });
    }

    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Doctor approval status has already been processed'
      });
    }

    doctor.status = status;
    if (status === 'rejected' && rejectionReason) {
      doctor.rejectionReason = rejectionReason;
    }
    await doctor.save();

    // Send notification and email
    const message = status === 'active' 
      ? 'Your doctor profile has been approved. You can now start accepting appointments.'
      : `Your doctor profile has been rejected. Reason: ${rejectionReason}`;

    await Notification.create({
      recipient: doctor.user._id,
      title: status === 'active' ? 'Profile Approved' : 'Profile Rejected',
      message,
      type: status === 'active' ? 'doctor_approved' : 'doctor_rejected',
      priority: 'high',
      category: status === 'active' ? 'success' : 'warning',
      relatedEntity: {
        entityType: 'doctor',
        entityId: doctor._id
      }
    });

    // Send email
    try {
      if (status === 'active') {
        await emailService.sendDoctorApproval(doctor.user.email, doctor);
      } else {
        await emailService.sendDoctorRejection(doctor.user.email, doctor, rejectionReason);
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    // Log activity
    const admin = await Admin.findOne({ user: req.userId });
    admin.activityLog.unshift({
      action: status === 'active' ? 'approved_doctor' : 'rejected_doctor',
      description: `${status === 'active' ? 'Approved' : 'Rejected'} doctor ${doctor.name}`,
      targetModel: 'Doctor',
      targetId: doctor._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      data: doctor
    });
  } catch (error) {
    console.error('Update doctor approval error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update doctor approval',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Suspend or activate doctor
 * @route   PATCH /api/admin/doctors/:id/suspend
 * @access  Private (Admin)
 */
exports.suspendDoctor = async (req, res) => {
  try {
    const { suspended, suspensionReason } = req.body;

    const doctor = await Doctor.findById(req.params.id).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.status = suspended ? 'suspended' : 'active';
    if (suspended && suspensionReason) {
      doctor.rejectionReason = suspensionReason;
    }
    await doctor.save();

    // Send notification
    await Notification.create({
      recipient: doctor.user._id,
      title: suspended ? 'Account Suspended' : 'Account Activated',
      message: suspended 
        ? `Your account has been suspended. Reason: ${suspensionReason}`
        : 'Your account has been activated. You can now accept appointments.',
      type: suspended ? 'doctor_rejected' : 'doctor_approved',
      priority: 'high',
      category: suspended ? 'warning' : 'success',
      relatedEntity: {
        entityType: 'doctor',
        entityId: doctor._id
      }
    });

    // Log activity
    const admin = await Admin.findOne({ user: req.userId });
    admin.activityLog.unshift({
      action: suspended ? 'suspended_doctor' : 'activated_doctor',
      description: `${suspended ? 'Suspended' : 'Activated'} doctor ${doctor.name}`,
      targetModel: 'Doctor',
      targetId: doctor._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${suspended ? 'suspended' : 'activated'} successfully`,
      data: doctor
    });
  } catch (error) {
    console.error('Suspend doctor error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to suspend/activate doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Block a doctor
 * @route   POST /api/admin/doctors/:id/block
 * @access  Private (Admin)
 */
exports.blockDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Block reason must be at least 10 characters'
      });
    }

    // Find the doctor
    const doctor = await Doctor.findById(id).populate('user', 'firstName lastName email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if already blocked
    if (doctor.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already blocked'
      });
    }

    const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;

    // Block the doctor
    doctor.isBlocked = true;
    doctor.blockedAt = new Date();
    doctor.blockedBy = req.userId; // Admin ID from auth middleware
    doctor.blockReason = reason.trim();
    await doctor.save();

    // Find all future appointments for this doctor
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureAppointments = await Appointment.find({
      doctor: id,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patient', 'user');

    // Cancel all future appointments and notify patients
    const notificationPromises = [];
    const cancelPromises = [];

    for (const appointment of futureAppointments) {
      // Cancel the appointment
      cancelPromises.push(
        Appointment.findByIdAndUpdate(appointment._id, {
          status: 'cancelled',
          cancellationReason: `Doctor ${doctorName} is temporarily unavailable. Please book an appointment with another doctor.`
        })
      );

      // Create notification for the patient
      if (appointment.patient && appointment.patient.user) {
        notificationPromises.push(
          Notification.create({
            recipient: appointment.patient.user,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled - Doctor Unavailable',
            message: `Your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} with ${doctorName} has been cancelled. The doctor is not available for some time. You may book an appointment with another doctor.`,
            priority: 'high',
            category: 'warning',
            relatedEntity: {
              entityType: 'appointment',
              entityId: appointment._id
            }
          })
        );
      }
    }

    // Execute all cancellations and notifications
    await Promise.all([...cancelPromises, ...notificationPromises]);

    // Send email notification to the doctor
    try {
      await emailService.sendEmail({
        to: doctor.user.email,
        subject: 'Account Blocked - MediCare Plus',
        html: `
          <h2>Account Blocked</h2>
          <p>Dear ${doctorName},</p>
          <p>Your account has been temporarily blocked by the administration.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>All your future appointments have been cancelled and patients have been notified.</p>
          <p>Please contact the administrator for more information.</p>
          <p>Best regards,<br>MediCare Plus Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send block notification email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `Doctor blocked successfully. ${futureAppointments.length} future appointments have been cancelled and patients have been notified.`,
      data: {
        blockedDoctor: doctorName,
        cancelledAppointments: futureAppointments.length,
        notifiedPatients: futureAppointments.length,
        blockReason: reason.trim()
      }
    });
  } catch (error) {
    console.error('Block doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Unblock a doctor
 * @route   POST /api/admin/doctors/:id/unblock
 * @access  Private (Admin)
 */
exports.unblockDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the doctor
    const doctor = await Doctor.findById(id).populate('user', 'firstName lastName email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is blocked
    if (!doctor.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not blocked'
      });
    }

    const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;

    // Unblock the doctor
    doctor.isBlocked = false;
    doctor.blockedAt = null;
    doctor.blockedBy = null;
    doctor.blockReason = null;
    await doctor.save();

    // Send email notification to the doctor
    try {
      await emailService.sendEmail({
        to: doctor.user.email,
        subject: 'Account Unblocked - MediCare Plus',
        html: `
          <h2>Account Unblocked</h2>
          <p>Dear ${doctorName},</p>
          <p>Your account has been unblocked by the administration.</p>
          <p>You can now log in and accept new appointments.</p>
          <p>Best regards,<br>MediCare Plus Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send unblock notification email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `Doctor unblocked successfully`,
      data: {
        unblockedDoctor: doctorName
      }
    });
  } catch (error) {
    console.error('Unblock doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all leave requests
 * @route   GET /api/admin/leaves
 * @access  Private (Admin)
 */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, doctorId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leaves = await Leave.find(query)
      .populate({
        path: 'doctor',
        select: 'name specialization user',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
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
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leave requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Approve or reject leave request
 * @route   PATCH /api/admin/leaves/:id/approval
 * @access  Private (Admin)
 */
exports.updateLeaveApproval = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Validate rejection reason if status is rejected
    if (status === 'rejected') {
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required and must be at least 10 characters when rejecting'
        });
      }
    }

    const leave = await Leave.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    leave.status = status;
    leave.approvedBy = req.userId;
    leave.approvedAt = new Date();
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    await leave.save();

    // If leave is approved, cancel all appointments during the leave period
    if (status === 'approved') {
      const startDate = new Date(leave.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(leave.endDate);
      endDate.setHours(23, 59, 59, 999);

      // Find all appointments for this doctor during the leave period
      const appointmentsToCancel = await Appointment.find({
        doctorId: leave.doctor._id,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['scheduled', 'confirmed'] }
      }).populate('patientId');

      // Calculate return date (day after leave ends)
      const returnDate = new Date(endDate);
      returnDate.setDate(returnDate.getDate() + 1);
      const returnDateFormatted = returnDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Cancel each appointment and notify patients
      const affectedAppointments = [];
      for (const appointment of appointmentsToCancel) {
        appointment.status = 'cancelled';
        appointment.cancellationReason = `Doctor is on ${leave.leaveType.replace('_', ' ')} leave from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. The doctor will return on ${returnDateFormatted}.`;
        appointment.cancelledBy = 'admin';
        appointment.cancelledAt = new Date();
        await appointment.save();

        // Track affected appointment
        affectedAppointments.push({
          appointment: appointment._id,
          action: 'cancelled',
          actionDate: new Date()
        });

        // Notify patient about cancellation
        if (appointment.patientId && appointment.patientId.userId) {
          await Notification.create({
            recipient: appointment.patientId.userId,
            title: 'Appointment Cancelled - Doctor on Leave',
            message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} has been cancelled because Dr. ${leave.doctor.name || 'your doctor'} is on leave. The doctor will return on ${returnDateFormatted}. Please reschedule your appointment.`,
            type: 'appointment_cancelled',
            relatedEntity: {
              entityType: 'appointment',
              entityId: appointment._id
            },
            priority: 'high',
            category: 'warning'
          });
        }
      }

      // Update leave record with affected appointments
      leave.affectedAppointments = affectedAppointments;
      leave.notificationSent.toPatients = affectedAppointments.length > 0;
      await leave.save();
    }

    // Send notification to doctor
    const message = status === 'approved'
      ? `Your leave request from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} has been approved.`
      : `Your leave request has been rejected. Reason: ${rejectionReason}`;

    if (leave.doctor && leave.doctor.user) {
      await Notification.create({
        recipient: leave.doctor.user._id || leave.doctor.user,
        title: status === 'approved' ? 'Leave Approved' : 'Leave Rejected',
        message,
        type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
        relatedEntity: {
          entityType: 'leave',
          entityId: leave._id
        },
        priority: status === 'approved' ? 'medium' : 'high',
        category: status === 'approved' ? 'success' : 'warning'
      });
    }

    // Send email
    try {
      if (leave.doctor && leave.doctor.user && leave.doctor.user.email) {
        if (status === 'approved') {
          await emailService.sendLeaveApproval(leave.doctor.user.email, leave);
        } else {
          await emailService.sendLeaveRejection(leave.doctor.user.email, leave, rejectionReason);
        }
      }
    } catch (emailError) {
      // Email failure should not stop the process
    }

    // Log activity
    const admin = await Admin.findOne({ userId: req.userId });
    if (admin) {
      admin.activityLog.unshift({
        action: status === 'approved' ? 'approved_leave' : 'rejected_leave',
        description: `${status === 'approved' ? 'Approved' : 'Rejected'} leave request from ${leave.doctor.name}`,
        targetModel: 'Leave',
        targetId: leave._id,
        timestamp: new Date()
      });
      await admin.save();
    }

    // Prepare response with additional info for approved leaves
    const responseData = {
      ...leave.toObject(),
      cancelledAppointmentsCount: status === 'approved' ? leave.affectedAppointments.length : 0
    };

    res.status(200).json({
      success: true,
      message: status === 'approved' 
        ? `Leave request approved successfully. ${leave.affectedAppointments.length} appointment(s) cancelled and patients notified.`
        : 'Leave request rejected successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Update leave approval error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update leave approval',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all patients
 * @route   GET /api/admin/patients
 * @access  Private (Admin)
 */
exports.getAllPatients = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 10 } = req.query;

    const query = {};

    // Build patient query
    const patients = await Patient.find(query)
      .populate({
        path: 'user',
        select: '-password -refreshToken'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter by search if provided
    let filteredPatients = patients;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = patients.filter(patient => {
        if (!patient.user) return false;
        const fullName = `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();
        const email = patient.user.email.toLowerCase();
        const phone = patient.user.phone || '';
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      const activeStatus = isActive === 'true';
      filteredPatients = filteredPatients.filter(patient => 
        patient.user?.isActive === activeStatus
      );
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = filteredPatients.length;
    const paginatedPatients = filteredPatients.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: paginatedPatients.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: paginatedPatients
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient by ID
 * @route   GET /api/admin/patients/:id
 * @access  Private (Admin)
 */
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate({
        path: 'user',
        select: '-password -refreshToken'
      })
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete patient
 * @route   DELETE /api/admin/patients/:id
 * @access  Private (Admin)
 */
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Delete associated user
    if (patient.user) {
      await User.findByIdAndDelete(patient.user);
    }

    // Delete patient
    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient appointments
 * @route   GET /api/admin/patients/:id/appointments
 * @access  Private (Admin)
 */
exports.getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, status } = req.query;

    // Verify patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Build query
    const query = { patient: id };
    if (status) {
      query.status = status;
    }

    // Fetch appointments
    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName email phone' }
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient prescriptions
 * @route   GET /api/admin/patients/:id/prescriptions
 * @access  Private (Admin)
 */
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Verify patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Fetch prescriptions
    const prescriptions = await Prescription.find({ patient: id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ prescriptionDate: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete doctor and cancel all future appointments
 * @route   DELETE /api/admin/doctors/:id
 * @access  Private (Admin)
 */
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the doctor
    const doctor = await Doctor.findById(id).populate('user', 'firstName lastName email');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;

    // Find all future appointments for this doctor
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureAppointments = await Appointment.find({
      doctor: id,
      appointmentDate: { $gte: today },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patient', 'user');

    // Cancel all future appointments and notify patients
    const notificationPromises = [];
    const cancelPromises = [];

    for (const appointment of futureAppointments) {
      // Cancel the appointment
      cancelPromises.push(
        Appointment.findByIdAndUpdate(appointment._id, {
          status: 'cancelled',
          cancellationReason: `Doctor ${doctorName} has been removed from the system by administration.`
        })
      );

      // Create notification for the patient
      if (appointment.patient && appointment.patient.user) {
        notificationPromises.push(
          Notification.create({
            recipient: appointment.patient.user,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled - Doctor Removed',
            message: `Your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} with ${doctorName} has been cancelled because the doctor has been removed from the system. Please book a new appointment with another doctor.`,
            priority: 'high',
            category: 'error',
            relatedEntity: {
              entityType: 'appointment',
              entityId: appointment._id
            }
          })
        );
      }
    }

    // Execute all cancellations and notifications
    await Promise.all([...cancelPromises, ...notificationPromises]);

    // Delete the doctor and associated user
    await Doctor.findByIdAndDelete(id);
    await User.findByIdAndDelete(doctor.user._id);

    res.status(200).json({
      success: true,
      message: `Doctor deleted successfully. ${futureAppointments.length} future appointments have been cancelled and patients have been notified.`,
      data: {
        deletedDoctor: doctorName,
        cancelledAppointments: futureAppointments.length,
        notifiedPatients: futureAppointments.length
      }
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;