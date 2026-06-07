// backend/controllers/doctorDashboard.controller.js
const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const BlockedSlot = require('../models/BlockedSlot.model');
const Leave = require('../models/Leave.model');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');
const { sendResponse } = require('../utils/responseHandler');

exports.getProfile = catchAsync(async (req, res) => {
  const doctor = await userService.getDoctorProfile(req.userId);
  return sendResponse(res, 200, true, 'Doctor profile retrieved', doctor);
});

exports.updateProfile = catchAsync(async (req, res) => {
  const doctor = await userService.updateDoctorProfile(req.userId, req.body);
  return sendResponse(res, 200, true, 'Profile updated successfully', doctor);
});

exports.getDashboard = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's appointments
  let todaysAppointments = [];
  try {
    todaysAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled', 'no-show'] }
    })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName phone email' }
      })
      .sort({ appointmentTime: 1 });

    todaysAppointments = await updateExpiredAppointments(todaysAppointments);
  } catch (err) {
    console.error('Error fetching today appointments for dashboard:', err);
  }

  // Upcoming appointments (next 7 days)
  let upcomingAppointments = [];
  try {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    upcomingAppointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: tomorrow, $lte: nextWeek },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName phone' }
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(10);
  } catch (err) {
    console.error('Error fetching upcoming appointments for dashboard:', err);
  }

  const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
  const completedAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    status: 'completed'
  });
  const pendingAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    status: { $in: ['scheduled', 'confirmed'] }
  });

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const monthlyAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const completedThisMonth = await Appointment.countDocuments({
    doctor: doctor._id,
    status: 'completed',
    appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const cancelledThisMonth = await Appointment.countDocuments({
    doctor: doctor._id,
    status: 'cancelled',
    appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const noShowsThisMonth = await Appointment.countDocuments({
    doctor: doctor._id,
    status: 'no-show',
    appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
  });

  let recentPrescriptions = [];
  try {
    recentPrescriptions = await Prescription.find({ doctor: doctor._id })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ prescriptionDate: -1 })
      .limit(5);
  } catch (err) {
    console.error('Error fetching prescriptions for dashboard:', err);
  }

  let pendingLeaves = [];
  try {
    pendingLeaves = await Leave.find({
      doctor: doctor._id,
      status: 'pending'
    }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching leaves for dashboard:', err);
  }

  const uniquePatients = await Appointment.distinct('patient', {
    doctor: doctor._id,
    status: 'completed'
  });

  return sendResponse(res, 200, true, 'Dashboard data retrieved successfully', {
    statistics: {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      monthlyAppointments,
      completedThisMonth,
      cancelledThisMonth,
      noShowsThisMonth,
      totalPatients: uniquePatients.length,
      todaysAppointmentsCount: todaysAppointments.length,
      rating: doctor.rating || { average: 0, count: 0 },
      totalRatings: doctor.totalRatings || 0
    },
    todaysAppointments,
    upcomingAppointments,
    recentPrescriptions,
    pendingLeaves
  });
});

exports.getAppointments = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { status, date, page = 1, limit = 10 } = req.query;
  const query = { doctor: doctor._id };

  if (status) {
    query.status = status;
  }

  if (date) {
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return sendResponse(res, 400, false, 'Invalid date format');
    }
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.appointmentDate = { $gte: searchDate, $lt: nextDay };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  let appointments = await Appointment.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName phone email dateOfBirth gender' }
    })
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  appointments = await updateExpiredAppointments(appointments);
  const total = await Appointment.countDocuments(query);

  return res.status(200).json({
    success: true,
    count: appointments.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: appointments
  });
});

exports.getAppointmentById = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName phone email dateOfBirth gender' }
    })
    .populate('prescription', '_id prescriptionId');

  if (!appointment) {
    return sendResponse(res, 404, false, 'Appointment not found');
  }

  if (!appointment.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'Access denied. Appointment does not belong to you');
  }

  return sendResponse(res, 200, true, 'Appointment retrieved', appointment);
});

exports.updateAppointmentStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return sendResponse(res, 404, false, 'Appointment not found');
  }

  if (!appointment.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'Access denied. Appointment does not belong to you');
  }

  const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return sendResponse(res, 400, false, 'Invalid status');
  }

  appointment.status = status;
  if (status === 'in_progress') {
    appointment.checkInTime = new Date();
  }
  if (status === 'completed') {
    appointment.checkOutTime = new Date();
    if (notes) {
      appointment.doctorNotes = notes;
    }
  }

  await appointment.save();
  return sendResponse(res, 200, true, 'Appointment status updated successfully', appointment);
});

exports.getPatients = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  // Only patients with at least one completed appointment
  const patientIds = await Appointment.distinct('patient', {
    doctor: doctor._id,
    status: 'completed'
  });

  const patients = await Patient.find({ _id: { $in: patientIds } })
    .populate('user', 'firstName lastName email phone address dateOfBirth gender')
    .select('bloodGroup allergies chronicDiseases currentMedications emergencyContact');

  const patientsWithStats = await Promise.all(
    patients.map(async (patient) => {
      const appointmentCount = await Appointment.countDocuments({
        doctor: doctor._id,
        patient: patient._id,
        status: 'completed'
      });

      const lastAppointment = await Appointment.findOne({
        doctor: doctor._id,
        patient: patient._id,
        status: 'completed'
      }).sort({ appointmentDate: -1 });

      return {
        ...patient.toObject(),
        appointmentCount,
        lastVisit: lastAppointment ? lastAppointment.appointmentDate : null
      };
    })
  );

  return sendResponse(res, 200, true, 'Patients retrieved successfully', patientsWithStats);
});

exports.getPatientDetails = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { patientId } = req.params;

  const hasAppointment = await Appointment.findOne({
    doctor: doctor._id,
    patient: patientId
  });

  if (!hasAppointment) {
    return sendResponse(res, 403, false, 'Access denied. No appointment history with this patient');
  }

  const patient = await Patient.findById(patientId).populate('user', 'firstName lastName email phone');
  if (!patient) {
    return sendResponse(res, 404, false, 'Patient not found');
  }

  const appointments = await Appointment.find({ doctor: doctor._id, patient: patientId }).sort({ appointmentDate: -1 });
  const prescriptions = await Prescription.find({ doctor: doctor._id, patient: patientId }).sort({ prescriptionDate: -1 });

  return sendResponse(res, 200, true, 'Patient details retrieved', { patient, appointments, prescriptions });
});

exports.getSchedule = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId }).select('availability consultationDuration consultationFee');
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  return res.status(200).json({
    success: true,
    data: doctor.availability || [],
    consultationDuration: doctor.consultationDuration,
    consultationFee: doctor.consultationFee
  });
});

exports.updateSchedule = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { availability, consultationDuration, consultationFee } = req.body;
  if (availability !== undefined) doctor.availability = availability;
  if (consultationDuration !== undefined) doctor.consultationDuration = consultationDuration;
  if (consultationFee !== undefined) doctor.consultationFee = consultationFee;

  await doctor.save();
  return sendResponse(res, 200, true, 'Schedule updated successfully', doctor.availability);
});

exports.getBlockedSlots = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const blockedSlots = await BlockedSlot.find({ doctor: doctor._id, isActive: true }).sort({ day: 1, startTime: 1 });
  return sendResponse(res, 200, true, 'Blocked slots retrieved', blockedSlots);
});

exports.blockSlot = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { day, startTime, endTime, reason } = req.body;
  if (!day || !startTime || !endTime) {
    return sendResponse(res, 400, false, 'Day, start time, and end time are required');
  }

  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (!validDays.includes(day.toLowerCase())) {
    return sendResponse(res, 400, false, 'Invalid day');
  }

  if (startTime >= endTime) {
    return sendResponse(res, 400, false, 'End time must be after start time');
  }

  // Check for overlapping blocked slots
  const overlapping = await BlockedSlot.findOne({
    doctor: doctor._id,
    day: day.toLowerCase(),
    isActive: true,
    $or: [
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  });

  if (overlapping) {
    return sendResponse(res, 400, false, 'This time slot overlaps with an existing blocked slot');
  }

  const blockedSlot = await BlockedSlot.create({
    doctor: doctor._id,
    day: day.toLowerCase(),
    startTime,
    endTime,
    reason: reason || ''
  });

  return sendResponse(res, 201, true, 'Time slot blocked successfully', blockedSlot);
});

exports.unblockSlot = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const blockedSlot = await BlockedSlot.findOne({ _id: req.params.id, doctor: doctor._id });
  if (!blockedSlot) {
    return sendResponse(res, 404, false, 'Blocked slot not found');
  }

  blockedSlot.isActive = false;
  await blockedSlot.save();

  return sendResponse(res, 200, true, 'Time slot unblocked successfully');
});

exports.getPrescriptions = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { patientId, startDate, endDate, page = 1, limit = 20 } = req.query;
  const query = { doctor: doctor._id };

  if (patientId) {
    query.patient = patientId;
  }

  if (startDate || endDate) {
    query.prescriptionDate = {};
    if (startDate) query.prescriptionDate.$gte = new Date(startDate);
    if (endDate) query.prescriptionDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const prescriptions = await Prescription.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate('appointment', 'appointmentDate appointmentTime')
    .sort({ prescriptionDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Prescription.countDocuments(query);

  return res.status(200).json({
    success: true,
    count: prescriptions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: prescriptions
  });
});