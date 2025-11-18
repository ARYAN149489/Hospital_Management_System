// backend/controllers/doctorDashboard.controller.js
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const Leave = require('../models/Leave.model');
const Patient = require('../models/Patient.model');
const BlockedSlot = require('../models/BlockedSlot.model');
const User = require('../models/User.model');
const { updateExpiredAppointments } = require('../utils/appointmentStatus');

/**
 * @desc    Get doctor's own profile
 * @route   GET /api/doctor/profile
 * @access  Private (Doctor)
 */
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .populate('user', '-password -refreshToken')
      .populate('department', 'name code description');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update doctor's own profile
 * @route   PUT /api/doctor/profile
 * @access  Private (Doctor)
 */
exports.updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId }).populate('user');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Doctor model fields
    const doctorUpdates = {};
    const doctorAllowedFields = [
      'specialization',
      'qualification',
      'experience',
      'consultationFee',
      'bio',
      'address',
      'languages',
      'availability'
    ];

    // User model fields
    const userUpdates = {};
    const userAllowedFields = ['phone'];

    // Separate updates for Doctor and User models
    Object.keys(req.body).forEach(key => {
      if (doctorAllowedFields.includes(key)) {
        doctorUpdates[key] = req.body[key];
      } else if (userAllowedFields.includes(key)) {
        userUpdates[key] = req.body[key];
      } else if (key === 'about') {
        // Map 'about' to 'bio' in Doctor model
        doctorUpdates.bio = req.body.about;
      }
    });

    // Update Doctor model
    if (Object.keys(doctorUpdates).length > 0) {
      await Doctor.findOneAndUpdate(
        { user: req.userId },
        doctorUpdates,
        { new: true, runValidators: true }
      );
    }

    // Update User model
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.userId,
        userUpdates,
        { new: true, runValidators: true }
      );
    }

    // Fetch updated doctor profile
    const updatedDoctor = await Doctor.findOne({ user: req.userId })
      .populate('user', '-password -refreshToken')
      .populate('department', 'name code description');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor dashboard statistics
 * @route   GET /api/doctor/dashboard
 * @access  Private (Doctor)
 */
exports.getDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
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
        status: { $nin: ['cancelled', 'no_show'] }
      })
        .populate({
          path: 'patient',
          populate: {
            path: 'user',
            select: 'firstName lastName phone email'
          }
        })
        .sort({ appointmentTime: 1 });
      
      // Update expired appointments
      todaysAppointments = await updateExpiredAppointments(todaysAppointments);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
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
          populate: {
            path: 'user',
            select: 'firstName lastName phone'
          }
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .limit(10);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }

    // Total appointments statistics
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctor._id
    });

    const completedAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'completed'
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // This month's appointments
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Recent prescriptions
    let recentPrescriptions = [];
    try {
      recentPrescriptions = await Prescription.find({
        doctor: doctor._id
      })
        .populate({
          path: 'patient',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .sort({ prescriptionDate: -1 })
        .limit(5);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }

    // Pending leave requests
    let pendingLeaves = [];
    try {
      pendingLeaves = await Leave.find({
        doctor: doctor._id,
        status: 'pending'
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }

    // Total patients treated
    const uniquePatients = await Appointment.distinct('patient', {
      doctor: doctor._id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalAppointments,
          completedAppointments,
          pendingAppointments,
          monthlyAppointments,
          totalPatients: uniquePatients.length,
          todaysAppointmentsCount: todaysAppointments.length,
          rating: doctor.rating || { average: 0, count: 0 },
          totalRatings: doctor.totalRatings || 0
        },
        todaysAppointments,
        upcomingAppointments,
        recentPrescriptions,
        pendingLeaves
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's appointments
 * @route   GET /api/doctor/appointments
 * @access  Private (Doctor)
 */
exports.getAppointments = async (req, res) => {
  console.log('📨 GET /api/doctor/appointments called');
  console.log('Query params:', req.query);
  console.log('User ID:', req.userId);
  
  try {
    const doctor = await Doctor.findOne({ user: req.userId });
    console.log('Doctor found:', doctor ? doctor._id : 'NOT FOUND');

    if (!doctor) {
      console.log('❌ Doctor not found for user:', req.userId);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const { status, date, page = 1, limit = 10 } = req.query;
    console.log('Filters - status:', status, 'date:', date, 'page:', page);

    const query = { doctor: doctor._id };

    if (status) {
      query.status = status;
    }

    if (date) {
      try {
        const searchDate = new Date(date);
        console.log('Parsing date:', date, '→', searchDate);
        
        // Validate date
        if (isNaN(searchDate.getTime())) {
          console.log('❌ Invalid date format:', date);
          return res.status(400).json({
            success: false,
            message: 'Invalid date format'
          });
        }
        
        searchDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.appointmentDate = { $gte: searchDate, $lt: nextDay };
        console.log('Date range:', searchDate, 'to', nextDay);
      } catch (dateError) {
        console.error('❌ Date parsing error:', dateError);
        return res.status(400).json({
          success: false,
          message: 'Invalid date parameter'
        });
      }
    }

    console.log('Query:', JSON.stringify(query));
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('Fetching appointments from database...');
    let appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName phone email dateOfBirth gender'
        }
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${appointments.length} appointments`);

    // Update expired appointments automatically
    try {
      console.log('Updating expired appointments...');
      appointments = await updateExpiredAppointments(appointments);
      console.log('✅ Expired appointments updated');
    } catch (updateError) {
      console.error('❌ Error updating expired appointments:', updateError);
      // Continue without updating status
    }

    const total = await Appointment.countDocuments(query);
    console.log('Total appointments matching query:', total);

    const responseData = {
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: appointments
    };

    console.log('✅ Sending response with', appointments.length, 'appointments');
    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Get doctor appointments error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/doctor/appointments/:id
 * @access  Private (Doctor)
 */
exports.getAppointmentById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName phone email dateOfBirth gender'
        }
      })
      .populate('prescription', '_id prescriptionId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify the appointment belongs to this doctor
    if (!appointment.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This appointment does not belong to you.'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update appointment status
 * @route   PATCH /api/doctor/appointments/:id/status
 * @access  Private (Doctor)
 */
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const doctor = await Doctor.findOne({ user: req.userId });

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor owns this appointment
    if (!appointment.doctor.equals(doctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
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

    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update appointment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's patients list
 * @route   GET /api/doctor/patients
 * @access  Private (Doctor)
 */
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get unique patients who had appointments with this doctor (including all statuses)
    const patientIds = await Appointment.distinct('patient', {
      doctor: doctor._id
    });

    const patients = await Patient.find({ _id: { $in: patientIds } })
      .populate('user', 'firstName lastName email phone address dateOfBirth gender')
      .select('bloodGroup allergies chronicDiseases currentMedications emergencyContact');

    // Get appointment count for each patient
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
        }).sort({ date: -1 });

        return {
          ...patient.toObject(),
          appointmentCount,
          lastVisit: lastAppointment ? lastAppointment.date : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientsWithStats.length,
      data: patientsWithStats
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get patient details (for doctor)
 * @route   GET /api/doctor/patients/:patientId
 * @access  Private (Doctor)
 */
exports.getPatientDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });
    const { patientId } = req.params;

    // Verify doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. No appointment history with this patient.'
      });
    }

    const patient = await Patient.findById(patientId)
      .populate('user', 'firstName lastName email phone');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get appointment history
    const appointments = await Appointment.find({
      doctor: doctor._id,
      patient: patientId
    }).sort({ date: -1 });

    // Get prescriptions
    const prescriptions = await Prescription.find({
      doctor: doctor._id,
      patient: patientId
    }).sort({ prescriptionDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient,
        appointments,
        prescriptions
      }
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's schedule/availability
 * @route   GET /api/doctor/schedule
 * @access  Private (Doctor)
 */
exports.getSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId })
      .select('availability consultationDuration consultationFee');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor.availability || [],
      consultationDuration: doctor.consultationDuration,
      consultationFee: doctor.consultationFee
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update doctor's schedule/availability
 * @route   PUT /api/doctor/schedule
 * @access  Private (Doctor)
 */
exports.updateSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const { availability, consultationDuration, consultationFee } = req.body;

    // Update fields if provided
    if (availability !== undefined) {
      doctor.availability = availability;
    }
    if (consultationDuration !== undefined) {
      doctor.consultationDuration = consultationDuration;
    }
    if (consultationFee !== undefined) {
      doctor.consultationFee = consultationFee;
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: doctor.availability
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's blocked time slots
 * @route   GET /api/doctor/blocked-slots
 * @access  Private (Doctor)
 */
exports.getBlockedSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const blockedSlots = await BlockedSlot.find({
      doctor: doctor._id,
      isActive: true
    }).sort({ day: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: blockedSlots.length,
      data: blockedSlots
    });
  } catch (error) {
    console.error('Get blocked slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Block a time slot
 * @route   POST /api/doctor/block-slot
 * @access  Private (Doctor)
 */
exports.blockSlot = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const { day, startTime, endTime, reason } = req.body;

    // Validate required fields
    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Day, start time, and end time are required'
      });
    }

    // Validate day
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day'
      });
    }

    // Validate time format and logic
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
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
      return res.status(400).json({
        success: false,
        message: 'This time slot overlaps with an existing blocked slot'
      });
    }

    const blockedSlot = await BlockedSlot.create({
      doctor: doctor._id,
      day: day.toLowerCase(),
      startTime,
      endTime,
      reason: reason || ''
    });

    res.status(201).json({
      success: true,
      message: 'Time slot blocked successfully',
      data: blockedSlot
    });
  } catch (error) {
    console.error('Block slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block time slot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Unblock a time slot
 * @route   DELETE /api/doctor/blocked-slots/:id
 * @access  Private (Doctor)
 */
exports.unblockSlot = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const blockedSlot = await BlockedSlot.findOne({
      _id: req.params.id,
      doctor: doctor._id
    });

    if (!blockedSlot) {
      return res.status(404).json({
        success: false,
        message: 'Blocked slot not found'
      });
    }

    // Soft delete by marking as inactive
    blockedSlot.isActive = false;
    await blockedSlot.save();

    // Or hard delete:
    // await BlockedSlot.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Time slot unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock time slot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor's prescriptions
 * @route   GET /api/doctor/prescriptions
 * @access  Private (Doctor)
 */
exports.getPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const { patientId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { doctor: doctor._id };

    // Filter by patient if provided
    if (patientId) {
      query.patient = patientId;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.prescriptionDate = {};
      if (startDate) {
        query.prescriptionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.prescriptionDate.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('appointment', 'appointmentDate appointmentTime')
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
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;