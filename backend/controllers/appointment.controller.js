// backend/controllers/appointment.controller.js
const catchAsync = require('../utils/catchAsync');
const appointmentService = require('../services/appointment.service');
const Appointment = require('../models/Appointment.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');
const { sendResponse } = require('../utils/responseHandler');

exports.bookAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.userId, req.body);
  return sendResponse(res, 201, true, 'Appointment booked successfully', appointment);
});

exports.getAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    });

  if (!appointment) {
    return sendResponse(res, 404, false, 'Appointment not found');
  }

  // Check auth
  if (req.user.role !== 'admin') {
    const patientProfile = await Patient.findOne({ user: req.userId });
    const doctorProfile = await Doctor.findOne({ user: req.userId });

    const isPatient = patientProfile && appointment.patient && appointment.patient.equals(patientProfile._id);
    const isDoctor = doctorProfile && appointment.doctor && appointment.doctor.equals(doctorProfile._id);

    if (!isPatient && !isDoctor) {
      return sendResponse(res, 403, false, 'Access denied. You are not involved in this appointment');
    }
  }

  return sendResponse(res, 200, true, 'Appointment retrieved successfully', appointment);
});

exports.cancelAppointment = catchAsync(async (req, res) => {
  const { cancelReason } = req.body;
  let profileId = null;

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.userId });
    if (!patient) return sendResponse(res, 404, false, 'Patient profile not found');
    profileId = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) return sendResponse(res, 404, false, 'Doctor profile not found');
    profileId = doctor._id;
  }

  const appointment = await appointmentService.cancelAppointment(
    req.params.id,
    req.user.role,
    cancelReason,
    profileId
  );

  return sendResponse(res, 200, true, 'Appointment cancelled successfully', appointment);
});

exports.rescheduleAppointment = catchAsync(async (req, res) => {
  const { date, time, newDate, newTime, reason } = req.body;
  let profileId = null;

  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.userId });
    if (!patient) return sendResponse(res, 404, false, 'Patient profile not found');
    profileId = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.userId });
    if (!doctor) return sendResponse(res, 404, false, 'Doctor profile not found');
    profileId = doctor._id;
  }

  // Support both field naming conventions from frontend
  const rescheduleDate = newDate || date;
  const rescheduleTime = newTime || time;

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    req.user.role,
    rescheduleDate,
    rescheduleTime,
    reason,
    profileId
  );

  return sendResponse(res, 200, true, 'Appointment rescheduled successfully', appointment);
});

exports.getAvailableSlots = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return sendResponse(res, 400, false, 'Date query parameter is required');
  }

  const result = await appointmentService.getAvailableSlots(doctorId, date);
  return sendResponse(res, 200, true, 'Available slots retrieved successfully', result);
});

exports.rateAppointment = catchAsync(async (req, res) => {
  const { rating, review } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return sendResponse(res, 404, false, 'Appointment not found');
  }

  const patient = await Patient.findOne({ user: req.userId });
  if (!patient || !appointment.patient.equals(patient._id)) {
    return sendResponse(res, 403, false, 'You can only rate your own appointments');
  }

  if (appointment.status !== 'completed') {
    return sendResponse(res, 400, false, 'You can only rate completed appointments');
  }

  appointment.rating = {
    score: rating,
    review: review || '',
    ratedAt: new Date()
  };

  await appointment.save();

  // Recalculate doctor ratings
  const doctor = await Doctor.findById(appointment.doctor);
  if (doctor) {
    const ratedAppointments = await Appointment.find({
      doctor: doctor._id,
      status: 'completed',
      'rating.score': { $exists: true }
    });

    const totalRating = ratedAppointments.reduce((sum, apt) => sum + apt.rating.score, 0);
    doctor.rating = {
      average: totalRating / ratedAppointments.length,
      count: ratedAppointments.length
    };
    await doctor.save();
  }

  return sendResponse(res, 200, true, 'Rating submitted successfully', appointment);
});

exports.getMyAppointments = catchAsync(async (req, res) => {
  const { status, startDate, endDate, type } = req.query;
  const query = {};

  const patient = await Patient.findOne({ user: req.userId });
  const doctor = await Doctor.findOne({ user: req.userId });

  if (patient) {
    query.patient = patient._id;
  } else if (doctor) {
    query.doctor = doctor._id;
  } else {
    return sendResponse(res, 404, false, 'User profile not found');
  }

  if (status && status.trim()) {
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
    if (startDate && startDate.trim()) query.appointmentDate.$gte = new Date(startDate);
    if (endDate && endDate.trim()) query.appointmentDate.$lte = new Date(endDate);
  }

  let appointments = await Appointment.find(query)
    .populate({
      path: 'patient',
      select: 'bloodGroup emergencyContact',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      select: 'specialization consultationFee yearsOfExperience',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate('prescription', '_id prescriptionId')
    .sort({ appointmentDate: -1 });

  appointments = await updateExpiredAppointments(appointments);

  const transformedAppointments = appointments.map(appointment => {
    const obj = appointment.toObject();

    if (obj.doctor && obj.doctor.user) {
      obj.doctor.name = `${obj.doctor.user.firstName} ${obj.doctor.user.lastName}`;
    } else if (!obj.doctor) {
      obj.doctor = {
        _id: null,
        name: 'Doctor Removed',
        specialization: 'N/A',
        user: null
      };
    }

    if (obj.patient && obj.patient.user) {
      obj.patient.name = `${obj.patient.user.firstName} ${obj.patient.user.lastName}`;
    } else if (!obj.patient) {
      obj.patient = {
        _id: null,
        name: 'Patient Removed',
        user: null
      };
    }

    return obj;
  });

  return res.status(200).json({
    success: true,
    count: transformedAppointments.length,
    data: transformedAppointments
  });
});