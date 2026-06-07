// backend/controllers/adminController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create Doctor Account (Admin Only)
exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      department,
      licenseNumber,
      consultationFee,
      availableDays,
      availableTimeSlots
    } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can create doctor accounts.'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Validate required fields
    if (!name || !email || !password || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create doctor account
    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'doctor',
      specialization,
      qualification,
      experience,
      department,
      licenseNumber,
      consultationFee,
      availableDays: availableDays || [],
      availableTimeSlots: availableTimeSlots || { start: '09:00', end: '17:00' },
      isActive: true,
      isApproved: true // Auto-approve since admin is creating
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          department: doctor.department,
          specialization: doctor.specialization
        }
      }
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor account',
      error: error.message
    });
  }
};

// Get all doctors (for admin management)
exports.getAllDoctors = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { doctors }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// Update doctor status (block/unblock)
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isActive } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: 'doctor' },
      { isActive },
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Doctor ${isActive ? 'activated' : 'blocked'} successfully`,
      data: { doctor }
    });

  } catch (error) {
    console.error('Update doctor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor status',
      error: error.message
    });
  }
};

// Delete doctor account
exports.deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const doctor = await User.findOneAndDelete({ _id: doctorId, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor account deleted successfully'
    });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor account',
      error: error.message
    });
  }
};