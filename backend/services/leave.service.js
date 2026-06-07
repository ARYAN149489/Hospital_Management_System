// backend/services/leave.service.js
const Leave = require('../models/Leave.model');
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
const Notification = require('../models/Notification.model');
const Admin = require('../models/Admin.model');
const AppError = require('../utils/appError');
const emailService = require('../utils/emailService');

class LeaveService {
  async applyLeave(userId, leaveData) {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
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
    } = leaveData;

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new AppError('Start date cannot be in the past', 400);
    }

    if (end < start) {
      throw new AppError('End date cannot be before start date', 400);
    }

    let calculatedTotalDays = totalDays;
    if (!calculatedTotalDays) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedTotalDays = isHalfDay ? 0.5 : diffDays;
    }

    // Check overlaps
    const overlappingLeave = await Leave.findOne({
      doctor: doctor._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      throw new AppError('You already have a leave request for this period', 400);
    }

    // Generate unique Leave ID
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await Leave.countDocuments();
    const leaveId = `LV${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Find affected appointments
    const affectedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
    });

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
      affectedAppointments: affectedAppointments.map(apt => ({ appointment: apt._id }))
    });

    await leave.populate([
      { path: 'doctor', select: 'name specialization' },
      { path: 'substituteDoctor', select: 'name specialization' }
    ]);

    return {
      leave,
      affectedAppointmentsCount: affectedAppointments.length
    };
  }

  async updateLeaveApproval(leaveId, adminUserId, approvalData) {
    const { status, rejectionReason } = approvalData;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status. Must be "approved" or "rejected"', 400);
    }

    if (status === 'rejected') {
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw new AppError('Rejection reason is required and must be at least 10 characters when rejecting', 400);
      }
    }

    const leave = await Leave.findById(leaveId).populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'pending') {
      throw new AppError('Leave request has already been processed', 400);
    }

    const admin = await Admin.findOne({ user: adminUserId });
    if (!admin) {
      throw new AppError('Admin profile not found', 404);
    }

    leave.status = status;
    if (status === 'approved') {
      leave.approvedBy = admin._id;
      leave.approvedAt = new Date();
      leave.rejectedBy = undefined;
      leave.rejectedAt = undefined;
      leave.rejectionReason = undefined;
    } else if (status === 'rejected') {
      leave.rejectedBy = admin._id;
      leave.rejectedAt = new Date();
      leave.rejectionReason = rejectionReason;
      leave.approvedBy = undefined;
      leave.approvedAt = undefined;
    }
    await leave.save();

    // If leave is approved, cancel all appointments during the leave period
    if (status === 'approved') {
      const startDate = new Date(leave.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(leave.endDate);
      endDate.setHours(23, 59, 59, 999);

      const appointmentsToCancel = await Appointment.find({
        doctor: leave.doctor._id,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['scheduled', 'confirmed', 'rescheduled'] }
      }).populate({
        path: 'patient',
        populate: { path: 'user' }
      });

      const returnDate = new Date(endDate);
      returnDate.setDate(returnDate.getDate() + 1);
      const returnDateFormatted = returnDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const affectedAppointments = [];
      for (const appointment of appointmentsToCancel) {
        appointment.status = 'cancelled';
        appointment.cancellationReason = `Doctor is on ${leave.leaveType.replace('_', ' ')} leave from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. The doctor will return on ${returnDateFormatted}.`;
        appointment.cancelledBy = 'admin';
        appointment.cancelledAt = new Date();
        await appointment.save();

        affectedAppointments.push({
          appointment: appointment._id,
          action: 'cancelled',
          actionDate: new Date()
        });

        // Notify patient
        if (appointment.patient && appointment.patient.user) {
          const docName = leave.doctor.user ? `${leave.doctor.user.firstName} ${leave.doctor.user.lastName}` : 'your doctor';
          await Notification.create({
            recipient: appointment.patient.user._id || appointment.patient.user,
            title: 'Appointment Cancelled - Doctor on Leave',
            message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} has been cancelled because Dr. ${docName} is on leave. The doctor will return on ${returnDateFormatted}. Please reschedule your appointment.`,
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

      leave.affectedAppointments = affectedAppointments;
      leave.notificationSent.toPatients = affectedAppointments.length > 0;
      await leave.save();
    }

    // Notify doctor
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
      console.error('⚠️ Leave approval email failed:', emailError.message);
    }

    // Log admin activity
    const docName = leave.doctor.user ? `${leave.doctor.user.firstName} ${leave.doctor.user.lastName}` : 'doctor';
    admin.activityLog.unshift({
      action: status === 'approved' ? 'approved_leave' : 'rejected_leave',
      description: `${status === 'approved' ? 'Approved' : 'Rejected'} leave request from Dr. ${docName}`,
      targetModel: 'Leave',
      targetId: leave._id,
      timestamp: new Date()
    });
    await admin.save();

    return leave;
  }
}

module.exports = new LeaveService();
