// backend/controllers/appointment.controller.js
const Appointment = require('../models/Appointment.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Department = require('../models/Department.model');
const Notification = require('../models/Notification.model');
const BlockedSlot = require('../models/BlockedSlot.model');
const emailService = require('../utils/emailService');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
exports.bookAppointment = async (req, res) => {
  try {
    console.log('📝 Booking appointment request body:', req.body);
    const { doctorId, departmentId, date, time, type, reason, symptoms } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time || !type || !reason) {
      console.log('❌ Missing required fields:', { doctorId, date, time, type, reason });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctorId, date, time, type, and reason are required'
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

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) {
      console.log('❌ Doctor not found:', doctorId);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    console.log('✅ Doctor found:', doctor._id, '- Approval Status:', doctor.approvalStatus);

    if (doctor.approvalStatus !== 'approved') {
      console.log('❌ Doctor not approved:', doctor.approvalStatus);
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      });
    }

    // Validate that appointment is not in the past
    const appointmentDate = new Date(date);
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointment for past date/time. Please select a future time slot.'
      });
    }

    // Check if appointment slot is available
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
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Check if the time slot is blocked by the doctor
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
      return res.status(400).json({
        success: false,
        message: 'This time slot has been blocked by the doctor. Please choose another time.'
      });
    }

    // Generate unique appointment ID
    const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const appointment = await Appointment.create({
      appointmentId,
      patient: patient._id,
      doctor: doctorId,
      appointmentDate: appointmentDate,
      appointmentTime: time,
      appointmentType: type,
      reasonForVisit: reason,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      status: 'scheduled'
    });

    // Populate appointment details
    await appointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } }
    ]);

    // Create notification for doctor
    await Notification.create({
      recipient: doctor.user._id,
      type: 'appointment_booked',
      title: 'New Appointment Request',
      message: `New appointment request from ${patient.user?.firstName || 'a patient'} for ${date} at ${time}`
    });

    // Send confirmation email to patient
    try {
      await emailService.sendAppointmentConfirmation(
        req.user.email,
        appointment
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to book appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get appointment details
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone email')
      .populate('doctor', 'name specialization consultationFee');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check access rights
    const patient = await Patient.findOne({ user: req.userId });
    const doctor = await Doctor.findOne({ user: req.userId });

    const isPatient = patient && appointment.patient._id.equals(patient._id);
    const isDoctor = doctor && appointment.doctor._id.equals(doctor._id);
    const isAdmin = req.userRole === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (Patient)
 */
exports.cancelAppointment = async (req, res) => {
  try {
    console.log('🔴 Cancel appointment request:');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request params:', req.params);
    console.log('User ID:', req.userId);
    
    const { cancelReason } = req.body;
    
    if (!cancelReason) {
      console.log('❌ No cancelReason in request body');
      return res.status(400).json({
        success: false,
        message: 'Cancel reason is required'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the patient
    const patient = await Patient.findOne({ user: req.userId });
    if (!appointment.patient._id.equals(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled at this time'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancelReason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = 'patient';
    await appointment.save();

    // Create notification for doctor
    if (appointment.doctor && appointment.doctor.user) {
      await Notification.create({
        recipient: appointment.doctor.user._id,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Appointment with ${appointment.patient.user ? appointment.patient.user.firstName + ' ' + appointment.patient.user.lastName : 'Patient'} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} has been cancelled. Reason: ${cancelReason}`,
        relatedEntity: {
          entityType: 'appointment',
          entityId: appointment._id
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Reschedule appointment
 * @route   PATCH /api/appointments/:id/reschedule
 * @access  Private (Patient)
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    console.log('📅 Reschedule appointment request:');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request params:', req.params);
    
    const { newDate, newTime, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the patient
    const patient = await Patient.findOne({ user: req.userId });
    if (!appointment.patient._id.equals(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only reschedule your own appointments'
      });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule completed or cancelled appointments'
      });
    }

    // Validate new date/time is in the future
    const newAppointmentDateTime = new Date(`${newDate}T${newTime}`);
    const now = new Date();
    
    if (newAppointmentDateTime < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to a past date/time'
      });
    }

    // Check if new slot is available
    const newAppointmentDate = new Date(newDate);
    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor._id,
      appointmentDate: {
        $gte: new Date(newDate + 'T00:00:00.000Z'),
        $lt: new Date(newDate + 'T23:59:59.999Z')
      },
      appointmentTime: newTime,
      status: { $nin: ['cancelled', 'no_show'] },
      _id: { $ne: appointment._id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'The new time slot is already booked'
      });
    }

    // Save old date/time
    const oldDate = appointment.appointmentDate;
    const oldTime = appointment.appointmentTime;

    // Update appointment
    appointment.appointmentDate = newAppointmentDate;
    appointment.appointmentTime = newTime;
    appointment.rescheduledFrom = {
      date: oldDate,
      time: oldTime
    };
    appointment.rescheduledReason = reason;

    await appointment.save();

    // Create notification for doctor
    if (appointment.doctor && appointment.doctor.user) {
      await Notification.create({
        recipient: appointment.doctor.user._id,
        type: 'appointment_rescheduled',
        title: 'Appointment Rescheduled',
        message: `Appointment with ${appointment.patient.user.firstName} ${appointment.patient.user.lastName} has been rescheduled from ${new Date(oldDate).toLocaleDateString()} at ${oldTime} to ${newAppointmentDate.toLocaleDateString()} at ${newTime}. Reason: ${reason}`,
        relatedEntity: {
          entityType: 'appointment',
          entityId: appointment._id
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('❌ Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get available slots for a doctor
 * @route   GET /api/appointments/available-slots/:doctorId
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    console.log('📅 Getting available slots for doctor:', doctorId, 'date:', date);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    
    // Get day name (e.g., 'monday', 'tuesday')
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestedDate.getDay()];
    
    console.log('📆 Requested day:', dayName);

    // Check if doctor is available on this day
    const dayAvailability = doctor.availability?.find(a => a.day === dayName && a.isAvailable);
    
    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      console.log('❌ Doctor not available on', dayName);
      return res.status(200).json({
        success: true,
        message: 'Doctor is not available on this day',
        data: {
          date: date,
          slots: []
        }
      });
    }

    console.log('✅ Doctor available on', dayName, 'with', dayAvailability.slots.length, 'time slots');

    // Get all booked appointments for this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      status: { $nin: ['cancelled', 'no_show'] }
    }).select('appointmentTime');

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
    console.log('📋 Booked times:', bookedTimes);

    // Get blocked slots for this day
    const blockedSlots = await BlockedSlot.find({
      doctor: doctorId,
      day: dayName,
      isActive: true
    }).select('startTime endTime');

    console.log('🚫 Blocked slots:', blockedSlots.length);

    // Helper function to check if a time is within a blocked slot
    const isTimeBlocked = (timeSlot) => {
      return blockedSlots.some(blocked => {
        return timeSlot >= blocked.startTime && timeSlot < blocked.endTime;
      });
    };

    // Check if the requested date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDateOnly = new Date(requestedDate);
    requestedDateOnly.setHours(0, 0, 0, 0);
    const isToday = requestedDateOnly.getTime() === today.getTime();
    
    // Get current time for filtering past slots
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Generate available slots (30-minute slots)
    const availableSlots = [];

    dayAvailability.slots.forEach(slot => {
      const startTime = slot.startTime; // e.g., "09:00"
      const endTime = slot.endTime;     // e.g., "17:00"

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      let currentSlotHour = startHour;
      let currentSlotMinute = startMinute;

      while (currentSlotHour < endHour || (currentSlotHour === endHour && currentSlotMinute < endMinute)) {
        const timeSlot = `${String(currentSlotHour).padStart(2, '0')}:${String(currentSlotMinute).padStart(2, '0')}`;
        
        // Skip past time slots if booking for today
        let isPast = false;
        if (isToday) {
          isPast = currentSlotHour < currentHour || 
                   (currentSlotHour === currentHour && currentSlotMinute <= currentMinute);
        }
        
        // Check if this slot is blocked by the doctor
        const isBlocked = isTimeBlocked(timeSlot);
        
        const isBooked = bookedTimes.includes(timeSlot);
        const isAvailable = !isBooked && !isPast && !isBlocked;
        
        availableSlots.push({
          time: timeSlot,
          available: isAvailable
        });

        // Move to next 30-minute slot
        currentSlotMinute += 30;
        if (currentSlotMinute >= 60) {
          currentSlotMinute = 0;
          currentSlotHour += 1;
        }
      }
    });

    console.log('✅ Generated', availableSlots.length, 'total slots');

    res.status(200).json({
      success: true,
      data: {
        date: date,
        doctorId: doctorId,
        slots: availableSlots
      }
    });
  } catch (error) {
    console.error('❌ Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Rate appointment
 * @route   PATCH /api/appointments/:id/rate
 * @access  Private (Patient)
 */
exports.rateAppointment = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the patient
    const patient = await Patient.findOne({ user: req.userId });
    if (!appointment.patient.equals(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own appointments'
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed appointments'
      });
    }

    appointment.rating = {
      score: rating,
      review: review || '',
      createdAt: new Date()
    };

    await appointment.save();

    // Update doctor's average rating
    const doctor = await Doctor.findById(appointment.doctor);
    const completedAppointments = await Appointment.find({
      doctor: doctor._id,
      status: 'completed',
      'rating.score': { $exists: true }
    });

    const totalRating = completedAppointments.reduce((sum, apt) => sum + apt.rating.score, 0);
    doctor.rating = totalRating / completedAppointments.length;
    doctor.totalRatings = completedAppointments.length;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all appointments for the logged in user (patient or doctor)
 * @route   GET /api/appointments/my-appointments
 * @access  Private
 */
exports.getMyAppointments = async (req, res) => {
  try {
    console.log('📅 getMyAppointments called');
    console.log('User ID:', req.userId);
    console.log('Query params:', req.query);
    
    const { status, startDate, endDate, type } = req.query;
    
    // Build query based on user role
    let query = {};
    
    // Check if user is a patient or doctor
    const patient = await Patient.findOne({ user: req.userId });
    const doctor = await Doctor.findOne({ user: req.userId });
    
    console.log('Patient found:', !!patient);
    console.log('Doctor found:', !!doctor);
    
    if (patient) {
      query.patient = patient._id;
      console.log('Searching for patient appointments:', patient._id);
    } else if (doctor) {
      query.doctor = doctor._id;
      console.log('Searching for doctor appointments:', doctor._id);
    } else {
      console.log('❌ No patient or doctor profile found for user:', req.userId);
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
    // Add optional filters
    if (status && status.trim()) {
      console.log('Filtering by status:', status);
      // Handle comma-separated status values
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        query.status = status.trim();
      }
    }
    
    if (type && type.trim()) {
      query.appointmentType = type.trim();
    }
    
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate && startDate.trim()) {
        query.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate && endDate.trim()) {
        query.appointmentDate.$lte = new Date(endDate);
      }
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    
    let appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        select: 'bloodGroup emergencyContact',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee experienceYears',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('prescription', '_id prescriptionId')
      .sort({ appointmentDate: -1 });
    
    // Update expired appointments automatically
    appointments = await updateExpiredAppointments(appointments);
    
    // Transform data to add doctor.name field for frontend compatibility
    const transformedAppointments = appointments.map(appointment => {
      const obj = appointment.toObject();
      
      // Handle case where doctor has been deleted
      if (obj.doctor && obj.doctor.user) {
        obj.doctor.name = `${obj.doctor.user.firstName} ${obj.doctor.user.lastName}`;
      } else if (!obj.doctor) {
        // Doctor was deleted - create placeholder data
        obj.doctor = {
          _id: null,
          name: 'Doctor Removed',
          specialization: 'N/A',
          user: null
        };
      }
      
      // Handle case where patient has been deleted (for doctor's view)
      if (obj.patient && obj.patient.user) {
        obj.patient.name = `${obj.patient.user.firstName} ${obj.patient.user.lastName}`;
      } else if (!obj.patient) {
        // Patient was deleted - create placeholder data
        obj.patient = {
          _id: null,
          name: 'Patient Removed',
          user: null
        };
      }
      
      return obj;
    });
    
    console.log('✅ Found', transformedAppointments.length, 'appointments');
    
    res.status(200).json({
      success: true,
      count: transformedAppointments.length,
      data: transformedAppointments
    });
  } catch (error) {
    console.error('❌ Get my appointments error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;