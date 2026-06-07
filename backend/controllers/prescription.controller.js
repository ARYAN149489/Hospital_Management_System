// backend/controllers/prescription.controller.js
const catchAsync = require('../utils/catchAsync');
const prescriptionService = require('../services/prescription.service');
const Prescription = require('../models/Prescription.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const { sendResponse } = require('../utils/responseHandler');

exports.createPrescription = catchAsync(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.userId, req.body);
  return sendResponse(res, 201, true, 'Prescription created successfully', prescription);
});

exports.getPrescription = catchAsync(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({
      path: 'patient',
      select: 'bloodGroup',
      populate: { path: 'user', select: 'firstName lastName email phone dateOfBirth gender' }
    })
    .populate({
      path: 'doctor',
      select: 'specialization medicalLicenseNumber licenseNumber',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('appointment', 'appointmentDate appointmentTime appointmentType');

  if (!prescription) {
    return sendResponse(res, 404, false, 'Prescription not found');
  }

  const doctor = await Doctor.findOne({ user: req.userId });
  const patient = await Patient.findOne({ user: req.userId });

  const isDoctor = doctor && prescription.doctor && prescription.doctor._id.equals(doctor._id);
  const isPatient = patient && prescription.patient && prescription.patient._id.equals(patient._id);
  const isAdmin = req.userRole === 'admin';

  if (!isDoctor && !isPatient && !isAdmin) {
    return sendResponse(res, 403, false, 'Access denied');
  }

  const prescriptionObj = prescription.toObject();
  if (prescriptionObj.doctor && prescriptionObj.doctor.user) {
    prescriptionObj.doctor.name = `${prescriptionObj.doctor.user.firstName} ${prescriptionObj.doctor.user.lastName}`;
  }
  if (prescriptionObj.patient && prescriptionObj.patient.user) {
    prescriptionObj.patient.name = `${prescriptionObj.patient.user.firstName} ${prescriptionObj.patient.user.lastName}`;
  }

  return sendResponse(res, 200, true, 'Prescription retrieved successfully', prescriptionObj);
});

exports.updatePrescription = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor profile not found');
  }

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return sendResponse(res, 404, false, 'Prescription not found');
  }

  if (!prescription.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'You can only update your own prescriptions');
  }

  if (prescription.validUntil && new Date() > prescription.validUntil) {
    return sendResponse(res, 400, false, 'Cannot update expired prescription');
  }

  const allowedUpdates = [
    'diagnosis',
    'chiefComplaints',
    'vitalSigns',
    'medications',
    'labTests',
    'advice',
    'dietaryAdvice',
    'followUp',
    'validUntil',
    'notes'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedPrescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate([
    { path: 'patient', populate: { path: 'user', select: 'firstName lastName' } },
    { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } }
  ]);

  return sendResponse(res, 200, true, 'Prescription updated successfully', updatedPrescription);
});

exports.getDoctorPrescriptions = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const { page = 1, limit = 10, patientId } = req.query;
  const query = { doctor: doctor._id };

  if (patientId) {
    query.patient = patientId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const prescriptions = await Prescription.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName phone email' }
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

exports.deletePrescription = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.userId });
  if (!doctor) {
    return sendResponse(res, 404, false, 'Doctor not found');
  }

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return sendResponse(res, 404, false, 'Prescription not found');
  }

  if (!prescription.doctor.equals(doctor._id)) {
    return sendResponse(res, 403, false, 'You can only delete your own prescriptions');
  }

  await prescription.deleteOne();
  return sendResponse(res, 200, true, 'Prescription deleted successfully');
});

exports.verifyPrescription = catchAsync(async (req, res) => {
  const { pharmacyName, pharmacistName } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return sendResponse(res, 404, false, 'Prescription not found');
  }

  prescription.pharmacyVerification = {
    verified: true,
    verifiedAt: new Date(),
    pharmacyName,
    pharmacistName
  };

  await prescription.save();
  return sendResponse(res, 200, true, 'Prescription verified successfully', prescription);
});