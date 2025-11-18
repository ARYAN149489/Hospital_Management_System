// backend/controllers/adminDashboard.controller.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const Leave = require('../models/Leave.model');
const Department = require('../models/Department.model');

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin)
 */
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.userId })
      .populate('userId', '-password -refreshToken');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/profile
 * @access  Private (Admin)
 */
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone'];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const admin = await Admin.findOneAndUpdate(
      { userId: req.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', '-password -refreshToken');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // User statistics
    const totalUsers = await User.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ status: 'active' });
    const pendingDoctors = await Doctor.countDocuments({ status: 'pending' });

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments();
    const todaysAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending'
    });
    const completedAppointments = await Appointment.countDocuments({
      status: 'completed'
    });

    // This month statistics
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyAppointments = await Appointment.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyNewPatients = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Prescription statistics
    const totalPrescriptions = await Prescription.countDocuments();

    // Leave statistics
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Department statistics
    const totalDepartments = await Department.countDocuments();

    // Recent activities - pending doctor approvals
    const recentPendingDoctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent pending leave requests
    const recentPendingLeaves = await Leave.find({ status: 'pending' })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent appointments
    const recentAppointments = await Appointment.find({
      date: { $gte: today }
    })
      .populate('patient', 'name')
      .populate('doctor', 'name specialization')
      .sort({ date: 1, time: 1 })
      .limit(10);

    // Revenue calculation (if consultation fees are tracked)
    const completedWithFees = await Appointment.find({
      status: 'completed',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('doctor', 'consultationFee');

    let monthlyRevenue = 0;
    completedWithFees.forEach(apt => {
      if (apt.consultationFee) {
        monthlyRevenue += apt.consultationFee;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          users: {
            total: totalUsers,
            patients: totalPatients,
            doctors: totalDoctors,
            activeDoctors,
            pendingDoctors
          },
          appointments: {
            total: totalAppointments,
            today: todaysAppointments,
            pending: pendingAppointments,
            completed: completedAppointments,
            monthly: monthlyAppointments
          },
          prescriptions: {
            total: totalPrescriptions
          },
          leaves: {
            pending: pendingLeaves
          },
          departments: {
            total: totalDepartments
          },
          monthly: {
            appointments: monthlyAppointments,
            newPatients: monthlyNewPatients,
            revenue: monthlyRevenue
          }
        },
        recentActivities: {
          pendingDoctors: recentPendingDoctors,
          pendingLeaves: recentPendingLeaves,
          upcomingAppointments: recentAppointments
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get system statistics (detailed)
 * @route   GET /api/admin/statistics
 * @access  Private (Admin)
 */
exports.getSystemStatistics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'

    const today = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    }

    // Appointment trends
    const appointments = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Appointment status breakdown
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top departments by appointments
    const topDepartments = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          department: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      }
    ]);

    // Top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        trends: {
          appointments,
          userRegistrations
        },
        breakdown: {
          appointmentsByStatus
        },
        topPerformers: {
          departments: topDepartments,
          doctors: topDoctors
        }
      }
    });
  } catch (error) {
    console.error('Get system statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all appointments (admin view)
 * @route   GET /api/admin/appointments
 * @access  Private (Admin)
 */
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctorId, patientId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.appointmentDate = { $gte: searchDate, $lt: nextDay };
    }

    if (doctorId) {
      query.doctor = doctorId;
    }

    if (patientId) {
      query.patient = patientId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName phone email' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName email phone' }
      })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    // Transform appointments to match frontend expectations (patientId/doctorId instead of patient/doctor)
    const transformedAppointments = appointments.map(apt => {
      const aptObj = apt.toObject();
      
      // Handle deleted doctor/patient - create placeholder
      if (!aptObj.doctor || !aptObj.doctor.user) {
        aptObj.doctor = {
          _id: aptObj.doctor?._id || null,
          name: 'Doctor Removed',
          specialization: 'N/A',
          user: null
        };
      } else {
        aptObj.doctor.name = `${aptObj.doctor.user.firstName} ${aptObj.doctor.user.lastName}`;
      }
      
      if (!aptObj.patient || !aptObj.patient.user) {
        aptObj.patient = {
          _id: aptObj.patient?._id || null,
          name: 'Patient Removed',
          user: null
        };
      } else {
        aptObj.patient.name = `${aptObj.patient.user.firstName} ${aptObj.patient.user.lastName}`;
      }
      
      return {
        ...aptObj,
        patientId: aptObj.patient,
        doctorId: aptObj.doctor,
        date: aptObj.appointmentDate,
        time: aptObj.appointmentTime
      };
    });

    res.status(200).json({
      success: true,
      count: transformedAppointments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transformedAppointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Log admin activity
 * @route   POST /api/admin/log-activity
 * @access  Private (Admin)
 */
exports.logActivity = async (req, res) => {
  try {
    const { action, description, targetModel, targetId } = req.body;

    const admin = await Admin.findOne({ userId: req.userId });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Add to activity log
    admin.activityLog.unshift({
      action,
      description,
      targetModel,
      targetId,
      timestamp: new Date()
    });

    // Keep only last 100 activities
    if (admin.activityLog.length > 100) {
      admin.activityLog = admin.activityLog.slice(0, 100);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/admin/recent-activity
 * @access  Private (Admin)
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent pending doctor approvals
    const pendingDoctors = await Doctor.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent pending leave requests
    const pendingLeaves = await Leave.find({ status: 'pending' })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ appointmentTime: 1 })
      .limit(5)
      .lean();

    // Compile recent activities
    const activities = [];

    // Add pending doctors
    pendingDoctors.forEach(doctor => {
      activities.push({
        type: 'doctor_approval',
        message: `New doctor registration: Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`,
        time: doctor.createdAt,
        priority: 'high'
      });
    });

    // Add pending leaves
    pendingLeaves.forEach(leave => {
      const doctorName = leave.doctor?.user ? 
        `Dr. ${leave.doctor.user.firstName} ${leave.doctor.user.lastName}` : 
        'Unknown Doctor';
      activities.push({
        type: 'leave_request',
        message: `Leave request from ${doctorName}`,
        time: leave.createdAt,
        priority: 'medium'
      });
    });

    // Add today's appointments
    todaysAppointments.forEach(apt => {
      const patientName = apt.patient?.user ? 
        `${apt.patient.user.firstName} ${apt.patient.user.lastName}` : 
        'Unknown Patient';
      const doctorName = apt.doctor?.user ? 
        `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}` : 
        'Unknown Doctor';
      activities.push({
        type: 'appointment',
        message: `Appointment: ${patientName} with ${doctorName}`,
        time: apt.appointmentDate,
        priority: 'low'
      });
    });

    // Sort by time (most recent first) and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: recentActivities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get system health
 * @route   GET /api/admin/system-health
 * @access  Private (Admin)
 */
exports.getSystemHealth = async (req, res) => {
  try {
    // Database health
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryHealth = memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'warning';

    // Uptime
    const uptime = process.uptime();
    const uptimePercentage = '99.9%'; // This would be calculated from actual monitoring data

    // Response time (simulated - you'd want real monitoring)
    const responseTime = '45ms';

    // Active connections (simulated)
    const activeConnections = await User.countDocuments({ 
      lastLogin: { 
        $gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
      } 
    });

    res.status(200).json({
      success: true,
      data: {
        database: dbStatus,
        memory: memoryHealth,
        uptime: uptimePercentage,
        responseTime: responseTime,
        activeConnections: activeConnections,
        serverUptime: Math.floor(uptime),
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;