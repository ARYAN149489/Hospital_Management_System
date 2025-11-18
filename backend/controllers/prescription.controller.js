// backend/controllers/prescription.controller.js
const Prescription = require('../models/Prescription.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Notification = require('../models/Notification.model');
const emailService = require('../utils/emailService');

/**
 * @desc    Create new prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor)
 */
exports.createPrescription = async (req, res) => {
  try {
    console.log('📝 CREATE PRESCRIPTION REQUEST');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID from token:', req.userId);
    
    const doctor = await Doctor.findOne({ user: req.userId });
    console.log('Doctor found:', doctor ? doctor._id : 'NOT FOUND');

    if (!doctor) {
      console.log('❌ Doctor profile not found for user:', req.userId);
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const {
      patientId,
      appointmentId,
      diagnosis,
      chiefComplaints,
      vitalSigns,
      medications,
      labTests,
      advice,
      dietaryAdvice,
      followUp,
      validUntil
    } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    console.log('Patient verified:', patient._id);
    console.log('Patient user ID:', patient.user?._id);

    // If appointment provided, verify it exists and belongs to this doctor
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      if (!appointment.doctor.equals(doctor._id)) {
        return res.status(403).json({
          success: false,
          message: 'This appointment does not belong to you'
        });
      }

      // Validate that appointment time has passed
      const appointmentDateTime = new Date(appointment.appointmentDate);
      const [hours, minutes] = appointment.appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      if (appointmentDateTime > now) {
        return res.status(400).json({
          success: false,
          message: 'Prescription can only be created after the appointment time has passed'
        });
      }
    }

    // Generate prescription ID
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await Prescription.countDocuments({
      prescriptionDate: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    const prescriptionId = `RX${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Create prescription
    const prescription = await Prescription.create({
      prescriptionId,
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      diagnosis,
      chiefComplaints,
      vitalSigns,
      medications,
      labTests,
      advice,
      dietaryAdvice,
      followUp,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    });

    // Update appointment with prescription reference
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescription: prescription._id
      });
    }

    // Populate prescription
    await prescription.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'doctor', select: 'name specialization' },
      { path: 'appointment', select: 'date time' }
    ]);

    // Create notification for patient
    console.log('Creating notification for user:', patient.user._id || patient.user);
    await Notification.create({
      recipient: patient.user._id || patient.user,
      title: 'New Prescription',
      message: `Dr. ${doctor.name} has created a new prescription for you`,
      type: 'prescription_added',
      relatedEntity: {
        entityType: 'prescription',
        entityId: prescription._id
      }
    });

    // Send email to patient
    try {
      const patientUser = await Patient.findById(patientId).populate('userId');
      await emailService.sendPrescriptionReady(patientUser.userId.email, prescription);
    } catch (emailError) {
      console.error('Failed to send prescription email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    console.error('❌ CREATE PRESCRIPTION ERROR');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // If it's a Mongoose validation error, log detailed field errors
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      });
    }
    
    console.error('Full error:', error);
    
    res.status(400).json({
      success: false,
      message: 'Failed to create prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      validationErrors: error.name === 'ValidationError' 
        ? Object.keys(error.errors).reduce((acc, field) => {
            acc[field] = error.errors[field].message;
            return acc;
          }, {})
        : undefined
    });
  }
};

/**
 * @desc    Get prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'patient',
        select: 'bloodGroup',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone dateOfBirth gender'
        }
      })
      .populate({
        path: 'doctor',
        select: 'specialization medicalLicenseNumber licenseNumber',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate appointmentTime appointmentType');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check access rights
    const doctor = await Doctor.findOne({ user: req.userId });
    const patient = await Patient.findOne({ user: req.userId });

    const isDoctor = doctor && prescription.doctor._id.equals(doctor._id);
    const isPatient = patient && prescription.patient._id.equals(patient._id);
    const isAdmin = req.userRole === 'admin';

    if (!isDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Transform the data to include doctor and patient names
    const prescriptionObj = prescription.toObject();
    if (prescriptionObj.doctor && prescriptionObj.doctor.user) {
      prescriptionObj.doctor.name = `${prescriptionObj.doctor.user.firstName} ${prescriptionObj.doctor.user.lastName}`;
    }
    if (prescriptionObj.patient && prescriptionObj.patient.user) {
      prescriptionObj.patient.name = `${prescriptionObj.patient.user.firstName} ${prescriptionObj.patient.user.lastName}`;
    }

    res.status(200).json({
      success: true,
      data: prescriptionObj
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update prescription
 * @route   PUT /api/prescriptions/:id
 * @access  Private (Doctor)
 */
exports.updatePrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Verify doctor owns this prescription
    if (!prescription.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own prescriptions'
      });
    }

    // Check if prescription is still valid
    if (new Date() > prescription.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update expired prescription'
      });
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
      { path: 'patient', select: 'name phone email' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: updatedPrescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's prescriptions
 * @route   GET /api/prescriptions/doctor/my-prescriptions
 * @access  Private (Doctor)
 */
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const { page = 1, limit = 10, patientId } = req.query;

    const query = { doctor: doctor._id };

    if (patientId) {
      query.patient = patientId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name phone email')
      .populate('appointment', 'date time')
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(query);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: prescriptions
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete prescription
 * @route   DELETE /api/prescriptions/:id
 * @access  Private (Doctor)
 */
exports.deletePrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Verify doctor owns this prescription
    if (!prescription.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own prescriptions'
      });
    }

    await prescription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Mark prescription as verified by pharmacy
 * @route   PATCH /api/prescriptions/:id/verify
 * @access  Private (Doctor/Admin)
 */
exports.verifyPrescription = async (req, res) => {
  try {
    const { pharmacyName, pharmacistName } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    prescription.pharmacyVerification = {
      verified: true,
      verifiedAt: new Date(),
      pharmacyName,
      pharmacistName
    };

    await prescription.save();

    res.status(200).json({
      success: true,
      message: 'Prescription verified successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Verify prescription error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to verify prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;