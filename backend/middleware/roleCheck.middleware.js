// backend/middleware/roleCheck.middleware.js

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Check if user has allowed role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
        requiredRole: allowedRoles.length === 1 ? allowedRoles[0] : allowedRoles
      });
    }
    
    next();
  };
};

/**
 * Middleware specifically for patient-only routes
 */
const patientOnly = (req, res, next) => {
  return checkRole('patient')(req, res, next);
};

/**
 * Middleware specifically for doctor-only routes
 */
const doctorOnly = (req, res, next) => {
  return checkRole('doctor')(req, res, next);
};

/**
 * Middleware specifically for admin-only routes
 */
const adminOnly = (req, res, next) => {
  return checkRole('admin')(req, res, next);
};

/**
 * Middleware for routes accessible by doctors and admins
 */
const doctorOrAdmin = (req, res, next) => {
  return checkRole('doctor', 'admin')(req, res, next);
};

/**
 * Middleware for routes accessible by patients and doctors
 */
const patientOrDoctor = (req, res, next) => {
  return checkRole('patient', 'doctor')(req, res, next);
};

/**
 * Middleware to check specific admin permissions
 */
const checkAdminPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // User must be admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required.'
        });
      }
      
      // Load admin profile if not already loaded
      if (!req.profile) {
        const Admin = require('../models/Admin.model');
        req.profile = await Admin.findOne({ user: req.user._id });
      }
      
      if (!req.profile) {
        return res.status(404).json({
          success: false,
          message: 'Admin profile not found.'
        });
      }
      
      // Check if admin has the specific permission
      if (!req.profile.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to ${permission}.`,
          requiredPermission: permission
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware to check if doctor is approved
 */
const requireApprovedDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Doctor access required.'
      });
    }
    
    // Load doctor profile if not already loaded
    if (!req.profile) {
      const Doctor = require('../models/Doctor.model');
      req.profile = await Doctor.findOne({ user: req.user._id });
    }
    
    if (!req.profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }
    
    // Check approval status
    if (req.profile.approvalStatus !== 'approved') {
      const messages = {
        pending: 'Your profile is pending approval. Please wait for admin verification.',
        rejected: 'Your profile was rejected. Please contact support.',
        suspended: 'Your account has been suspended. Please contact support.'
      };
      
      return res.status(403).json({
        success: false,
        message: messages[req.profile.approvalStatus] || 'Profile approval required.',
        status: req.profile.approvalStatus
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking doctor approval status.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check if doctor is available (not on leave)
 */
const requireAvailableDoctor = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Doctor access required.'
      });
    }
    
    // Load doctor profile if not already loaded
    if (!req.profile) {
      const Doctor = require('../models/Doctor.model');
      req.profile = await Doctor.findOne({ user: req.user._id });
    }
    
    if (!req.profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }
    
    // Check if doctor is on leave
    if (req.profile.currentLeaveStatus === 'on_leave') {
      return res.status(403).json({
        success: false,
        message: 'You are currently on leave. This action is not allowed.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking doctor availability.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to check resource ownership
 * Allows users to access only their own resources
 */
const checkResourceOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // Admins can access all resources
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if resource belongs to the requesting user
    const resourceUserId = req.resource?.[resourceUserField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ownership cannot be determined.'
      });
    }
    
    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

/**
 * Middleware to allow access to own resources or admin
 */
const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // Admins can access all resources
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if resource belongs to the requesting user
    const resourceUserId = req.resource?.[resourceUserField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ownership cannot be determined.'
      });
    }
    
    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources or must be an admin.'
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user can perform action on appointment
 * Patient who booked it, assigned doctor, or admin
 */
const canAccessAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id || req.params.appointmentId;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID required.'
      });
    }
    
    const Appointment = require('../models/Appointment.model');
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }
    
    // Admin can access all appointments
    if (req.user.role === 'admin') {
      req.appointment = appointment;
      return next();
    }
    
    // Check if user is the patient or doctor involved
    const userProfile = req.profile;
    
    const isPatient = appointment.patient.toString() === userProfile._id.toString();
    const isDoctor = appointment.doctor.toString() === userProfile._id.toString();
    
    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to access this appointment.'
      });
    }
    
    req.appointment = appointment;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking appointment access.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  checkRole,
  patientOnly,
  doctorOnly,
  adminOnly,
  doctorOrAdmin,
  patientOrDoctor,
  checkAdminPermission,
  requireApprovedDoctor,
  requireAvailableDoctor,
  checkResourceOwnership,
  ownerOrAdmin,
  canAccessAppointment
};