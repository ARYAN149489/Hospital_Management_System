// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to authenticate user using JWT token
 * Expects token in Authorization header as "Bearer <token>"
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware - checking authentication');
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
    
    // Get token from header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    console.log('✅ Token found, verifying...');
    
    // Verify token
    const decoded = verifyToken(token);
    
    console.log('✅ Token verified, user ID:', decoded.id);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }
    
    console.log('✅ User found:', user.email);
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      console.log('❌ Password changed after token issued');
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please login again.'
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    console.log('✅ Authentication successful, passing to next middleware');
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work for both authenticated and guest users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to verify email before accessing certain routes
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this resource.'
    });
  }
  next();
};

/**
 * Middleware to check if user profile is complete
 */
const requireCompleteProfile = async (req, res, next) => {
  try {
    const role = req.user.role;
    let isComplete = true;
    
    if (role === 'patient') {
      const Patient = require('../models/Patient.model');
      const patient = await Patient.findOne({ user: req.user._id });
      
      if (!patient || patient.registrationStatus !== 'completed') {
        isComplete = false;
      }
    } else if (role === 'doctor') {
      const Doctor = require('../models/Doctor.model');
      const doctor = await Doctor.findOne({ user: req.user._id });
      
      if (!doctor || doctor.approvalStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your profile is pending approval. Please wait for admin verification.'
        });
      }
      
      if (doctor.approvalStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your profile was rejected. Please contact support.'
        });
      }
    }
    
    if (!isComplete) {
      return res.status(403).json({
        success: false,
        message: 'Please complete your profile to access this resource.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking profile completion.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to attach user profile to request
 * Loads Patient/Doctor/Admin data based on user role
 */
const attachProfile = async (req, res, next) => {
  try {
    const role = req.user.role;
    
    if (role === 'patient') {
      const Patient = require('../models/Patient.model');
      req.profile = await Patient.findOne({ user: req.user._id });
    } else if (role === 'doctor') {
      const Doctor = require('../models/Doctor.model');
      req.profile = await Doctor.findOne({ user: req.user._id }).populate('department');
    } else if (role === 'admin') {
      const Admin = require('../models/Admin.model');
      req.profile = await Admin.findOne({ user: req.user._id });
    }
    
    if (!req.profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete your registration.'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error loading profile.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate limiting per user
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.userId) return next();
    
    const userId = req.userId.toString();
    const now = Date.now();
    
    if (!requests.has(userId)) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const userRequests = requests.get(userId);
    
    if (now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireEmailVerification,
  requireCompleteProfile,
  attachProfile,
  userRateLimit
};