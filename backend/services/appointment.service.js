// backend/services/appointment.service.js
const Appointment = require('../models/Appointment.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const BlockedSlot = require('../models/BlockedSlot.model');
const Notification = require('../models/Notification.model');
const AppError = require('../utils/appError');
const emailService = require('../utils/emailService');

class AppointmentService {
  async bookAppointment(userId, bookingData) {
    const { doctorId, date, time, type, reason, symptoms } = bookingData;

    // Validate patient profile
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    if (doctor.approvalStatus !== 'approved') {
      throw new AppError('Doctor is not available for appointments', 400);
    }

    // Validate appointment datetime
    const appointmentDate = new Date(date);
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      throw new AppError('Cannot book appointment for past date/time. Please select a future time slot.', 400);
    }

    // Check double-booking
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      appointmentTime: time,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (existingAppointment) {
      throw new AppError('This time slot is already booked', 400);
    }

    // Check if slot is blocked by doctor
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const requestedDay = dayNames[appointmentDate.getDay()];

    const blockedSlot = await BlockedSlot.findOne({
      doctor: doctorId,
      day: requestedDay,
      isActive: true,
      startTime: { $lte: time },
      endTime: { $gt: time }
    });

    if (blockedSlot) {
      throw new AppError('This time slot has been blocked by the doctor. Please choose another time.', 400);
    }

    // Generate unique ID
    const dateStr = date.replace(/-/g, '');
    const count = await Appointment.countDocuments();
    const appointmentId = `APT${dateStr}${String(count + 1).padStart(4, '0')}`;

    const appointment = await Appointment.create({
      appointmentId,
      patient: patient._id,
      doctor: doctorId,
      appointmentDate,
      appointmentTime: time,
      appointmentType: type,
      reasonForVisit: reason,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      status: 'scheduled'
    });

    await appointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } }
    ]);

    // Create Notification
    await Notification.create({
      recipient: doctor.user._id,
      type: 'appointment_booked',
      title: 'New Appointment Request',
      message: `New appointment request from ${patient.name || 'a patient'} for ${date} at ${time}`,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointment._id
      }
    });

    // Send confirmation email
    emailService.sendAppointmentConfirmation(patient.email, appointment).catch(err => {
      console.error('⚠️ Failed to send confirmation email:', err.message);
    });

    return appointment;
  }

  async getAvailableSlots(doctorId, date) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const requestedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestedDate.getDay()];

    const dayAvailability = doctor.availability?.find(a => a.day === dayName && a.isAvailable);
    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      return { date, doctorId, slots: [] };
    }

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      status: { $nin: ['cancelled', 'no_show'] }
    }).select('appointmentTime');

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

    const blockedSlots = await BlockedSlot.find({
      doctor: doctorId,
      day: dayName,
      isActive: true
    }).select('startTime endTime');

    const isTimeBlocked = (timeSlot) => {
      return blockedSlots.some(blocked => timeSlot >= blocked.startTime && timeSlot < blocked.endTime);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDateOnly = new Date(requestedDate);
    requestedDateOnly.setHours(0, 0, 0, 0);
    const isToday = requestedDateOnly.getTime() === today.getTime();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const availableSlots = [];

    dayAvailability.slots.forEach(slot => {
      const startTime = slot.startTime;
      const endTime = slot.endTime;

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      let currentSlotHour = startHour;
      let currentSlotMinute = startMinute;

      while (currentSlotHour < endHour || (currentSlotHour === endHour && currentSlotMinute < endMinute)) {
        const timeSlot = `${String(currentSlotHour).padStart(2, '0')}:${String(currentSlotMinute).padStart(2, '0')}`;
        
        let isPast = false;
        if (isToday) {
          isPast = currentSlotHour < currentHour || 
                   (currentSlotHour === currentHour && currentSlotMinute <= currentMinute);
        }

        const isBlocked = isTimeBlocked(timeSlot);
        const isBooked = bookedTimes.includes(timeSlot);
        const isAvailable = !isBooked && !isPast && !isBlocked;

        availableSlots.push({
          time: timeSlot,
          available: isAvailable
        });

        currentSlotMinute += 30;
        if (currentSlotMinute >= 60) {
          currentSlotMinute = 0;
          currentSlotHour += 1;
        }
      }
    });

    return { date, doctorId, slots: availableSlots };
  }

  async cancelAppointment(appointmentId, cancelledByRole, reason, userProfileId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.status === 'cancelled') {
      throw new AppError('Appointment is already cancelled', 400);
    }

    if (appointment.status === 'completed') {
      throw new AppError('Completed appointments cannot be cancelled', 400);
    }

    // Role specific cancellation authorization check
    if (cancelledByRole === 'patient' && appointment.patient.toString() !== userProfileId.toString()) {
      throw new AppError('You are not authorized to cancel this appointment', 403);
    }
    if (cancelledByRole === 'doctor' && appointment.doctor.toString() !== userProfileId.toString()) {
      throw new AppError('You are not authorized to cancel this appointment', 403);
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'Cancelled by user';
    appointment.cancelledBy = cancelledByRole;
    appointment.cancelledAt = new Date();
    await appointment.save();

    await appointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } }
    ]);

    // Send notifications
    const recipientUser = cancelledByRole === 'patient' ? appointment.doctor.user._id : appointment.patient.user._id;
    await Notification.create({
      recipient: recipientUser,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Appointment scheduled on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime} has been cancelled.`,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointment._id
      }
    });

    // Send email notifications
    const recipientEmail = cancelledByRole === 'patient' ? appointment.doctor.user.email : appointment.patient.user.email;
    emailService.sendAppointmentCancellation(recipientEmail, appointment).catch(err => {
      console.error('⚠️ Failed to send cancellation email:', err.message);
    });

    return appointment;
  }

  async rescheduleAppointment(appointmentId, role, date, time, reason, userProfileId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new AppError(`Cannot reschedule a ${appointment.status} appointment`, 400);
    }

    // Double booking check for reschedule time slot
    const doubleBooked = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      appointmentTime: time,
      status: { $nin: ['cancelled', 'no_show'] },
      _id: { $ne: appointment._id }
    });

    if (doubleBooked) {
      throw new AppError('The requested time slot is already booked', 400);
    }

    // Record original schedule
    appointment.rescheduledFrom = {
      date: appointment.appointmentDate,
      time: appointment.appointmentTime
    };

    appointment.appointmentDate = new Date(date);
    appointment.appointmentTime = time;
    appointment.status = 'rescheduled';
    appointment.rescheduledReason = reason || 'Rescheduled';
    await appointment.save();

    await appointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } }
    ]);

    // Send notification
    const recipientUser = role === 'patient' ? appointment.doctor.user._id : appointment.patient.user._id;
    await Notification.create({
      recipient: recipientUser,
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Appointment has been rescheduled to ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}`,
      relatedEntity: {
        entityType: 'appointment',
        entityId: appointment._id
      }
    });

    return appointment;
  }
}

module.exports = new AppointmentService();
