// backend/controllers/doctor.controller.js
const Doctor = require('../models/Doctor.model');
const Department = require('../models/Department.model');
const Appointment = require('../models/Appointment.model');
const Leave = require('../models/Leave.model');

/**
 * @desc    Get all doctors (with filters and pagination)
 * @route   GET /api/doctors
 * @access  Public
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      department,
      search,
      minRating,
      minExperience,
      maxFee,
      availability,
      sortBy,
      page = 1,
      limit = 10
    } = req.query;

    const query = { 
      approvalStatus: 'approved', // Only show approved doctors
      isBlocked: { $ne: true } // Exclude explicitly blocked doctors (handles undefined and false)
    };

    // Filter by specialization (only if not empty string)
    if (specialization && specialization.trim()) {
      query.specialization = new RegExp(specialization, 'i');
    }

    // Filter by department (only if not empty string)
    if (department && department.trim()) {
      query.department = department;
    }

    // Search by name OR specialization
    if (search && search.trim()) {
      console.log('🔍 Searching for:', search);
      
      // Split search query into words for better matching
      const searchWords = search.trim().split(/\s+/);
      console.log('🔤 Search words:', searchWords);
      
      // First, find users whose names match the search query
      const User = require('../models/User.model');
      
      // Build OR conditions for each word in first/last name
      const userSearchConditions = [];
      searchWords.forEach(word => {
        userSearchConditions.push(
          { firstName: new RegExp(word, 'i') },
          { lastName: new RegExp(word, 'i') }
        );
      });
      
      const matchingUsers = await User.find({
        $or: userSearchConditions
      }).select('_id');

      const matchingUserIds = matchingUsers.map(u => u._id);
      console.log('Found', matchingUserIds.length, 'matching users by name');

      // Build $or condition for name OR specialization search
      query.$or = [
        { specialization: new RegExp(search, 'i') }
      ];
      
      if (matchingUserIds.length > 0) {
        query.$or.push({ user: { $in: matchingUserIds } });
      }
    }

    // Filter by minimum rating (only if not empty string and valid number)
    if (minRating && minRating.trim() && !isNaN(parseFloat(minRating))) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Filter by minimum experience (only if not empty string and valid number)
    if (minExperience && minExperience.trim() && !isNaN(parseInt(minExperience))) {
      query.experienceYears = { $gte: parseInt(minExperience) };
    }

    // Filter by maximum consultation fee (only if not empty string and valid number)
    if (maxFee && maxFee.trim() && !isNaN(parseFloat(maxFee))) {
      query.consultationFee = { $lte: parseFloat(maxFee) };
    }

    // Filter by availability (day of week)
    if (availability && availability.trim()) {
      query[`availability.${availability.toLowerCase()}.available`] = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sorting
    let sortOptions = { 'rating.average': -1 }; // default sort by rating descending
    if (sortBy && sortBy.trim()) {
      if (sortBy === 'rating') {
        sortOptions = { 'rating.average': -1 };
      } else if (sortBy === 'fee-low') {
        sortOptions = { consultationFee: 1 };
      } else if (sortBy === 'fee-high') {
        sortOptions = { consultationFee: -1 };
      } else if (sortBy === 'experience') {
        sortOptions = { experienceYears: -1 };
      }
    }

    console.log('📊 Query:', JSON.stringify(query, null, 2));
    console.log('🔄 Sort:', sortOptions);

    const doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email')
      .populate('department', 'name code')
      .select('-medicalLicenseDocument -resumeDocument')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    // Transform data for frontend compatibility
    const transformedDoctors = doctors.map(doctor => {
      const obj = doctor.toObject();
      
      // Add doctor name from user
      if (obj.user) {
        obj.name = `${obj.user.firstName} ${obj.user.lastName}`;
      }
      
      // Flatten rating object - send average and count separately
      if (obj.rating) {
        obj.ratingAverage = obj.rating.average || 0;
        obj.totalReviews = obj.rating.count || 0;
        obj.rating = obj.rating.average || 0; // For backward compatibility
      }
      
      // Map field names for frontend
      obj.experience = obj.yearsOfExperience || obj.experienceYears || 0;
      obj.qualification = obj.qualifications && obj.qualifications.length > 0 
        ? obj.qualifications.map(q => q.degree).join(', ')
        : 'Not specified';
      
      return obj;
    });

    res.status(200).json({
      success: true,
      count: transformedDoctors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transformedDoctors
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('department', 'name code description');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor statistics
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'completed'
    });

    const upcomingAppointments = await Appointment.countDocuments({
      doctor: doctor._id,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Transform doctor data
    const doctorObj = doctor.toObject();
    if (doctorObj.user) {
      doctorObj.name = `${doctorObj.user.firstName} ${doctorObj.user.lastName}`;
    }
    if (doctorObj.rating) {
      doctorObj.ratingAverage = doctorObj.rating.average || 0;
      doctorObj.totalReviews = doctorObj.rating.count || 0;
      doctorObj.rating = doctorObj.rating.average || 0;
    }
    doctorObj.experience = doctorObj.yearsOfExperience || doctorObj.experienceYears || 0;
    doctorObj.qualification = doctorObj.qualifications && doctorObj.qualifications.length > 0 
      ? doctorObj.qualifications.map(q => q.degree).join(', ')
      : 'Not specified';

    res.status(200).json({
      success: true,
      data: {
        ...doctorObj,
        statistics: {
          totalAppointments,
          upcomingAppointments
        }
      }
    });
  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Search doctors
 * @route   GET /api/doctors/search
 * @access  Public
 */
exports.searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log('🔍 Searching doctors with query:', query);

    // Split search query into words for better matching (e.g., "Rajesh Kumar" -> ["Rajesh", "Kumar"])
    const searchWords = query.trim().split(/\s+/);
    console.log('🔤 Search words:', searchWords);

    // First, find users whose names match the search query
    const User = require('../models/User.model');
    
    // Build OR conditions for each word in first/last name
    const userSearchConditions = [];
    searchWords.forEach(word => {
      userSearchConditions.push(
        { firstName: new RegExp(word, 'i') },
        { lastName: new RegExp(word, 'i') }
      );
    });
    
    const matchingUsers = await User.find({
      $or: userSearchConditions
    }).select('_id');

    const matchingUserIds = matchingUsers.map(u => u._id);
    console.log('Found', matchingUserIds.length, 'matching users by name');

    // Build search criteria for doctors
    const searchCriteria = {
      approvalStatus: 'approved', // Only show approved doctors
      isBlocked: { $ne: true } // Exclude explicitly blocked doctors (handles undefined and false)
    };

    // Build the search $or array
    const searchOrConditions = [
      { specialization: new RegExp(query, 'i') },
      { qualifications: { $elemMatch: { degree: { $regex: query, $options: 'i' } } } }
    ];

    // If we found matching users, add them to the search criteria
    if (matchingUserIds.length > 0) {
      searchOrConditions.push({ user: { $in: matchingUserIds } });
    }

    searchCriteria.$or = searchOrConditions;

    const doctors = await Doctor.find(searchCriteria)
      .populate('user', 'firstName lastName email phone')
      .populate('department', 'name')
      .select('specialization rating consultationFee experienceYears qualifications')
      .limit(20);

    console.log('Found', doctors.length, 'doctors matching search');

    // Transform data to include name field for frontend compatibility
    const transformedDoctors = doctors.map(doctor => {
      const obj = doctor.toObject();
      if (obj.user) {
        obj.name = `${obj.user.firstName} ${obj.user.lastName}`;
      }
      // Map experienceYears to experience for frontend compatibility
      if (obj.experienceYears !== undefined) {
        obj.experience = obj.experienceYears;
      }
      // Transform rating object to number
      if (obj.rating && typeof obj.rating === 'object') {
        obj.totalReviews = obj.rating.totalReviews || 0;
        obj.rating = obj.rating.average || 0;
      }
      // Format qualifications array to string
      if (obj.qualifications && Array.isArray(obj.qualifications)) {
        obj.qualification = obj.qualifications.map(q => q.degree).join(', ');
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: transformedDoctors.length,
      data: transformedDoctors
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctors by specialization
 * @route   GET /api/doctors/specialization/:specialization
 * @access  Public
 */
exports.getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;

    const doctors = await Doctor.find({
      approvalStatus: 'approved',
      specialization: new RegExp(specialization, 'i')
    })
      .populate('user', 'firstName lastName')
      .populate('department', 'name')
      .sort({ 'rating.average': -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors by specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctors by department
 * @route   GET /api/doctors/department/:departmentId
 * @access  Public
 */
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const doctors = await Doctor.find({
      approvalStatus: 'approved',
      department: departmentId
    })
      .populate('user', 'firstName lastName')
      .populate('department', 'name code')
      .sort({ 'rating.average': -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get doctor availability
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get approved leaves for the next 30 days
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const leaves = await Leave.find({
      doctor: doctor._id,
      status: 'approved',
      startDate: { $lte: next30Days },
      endDate: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        availability: doctor.availability,
        leaves: leaves.map(leave => ({
          startDate: leave.startDate,
          endDate: leave.endDate,
          type: leave.leaveType
        }))
      }
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get top rated doctors
 * @route   GET /api/doctors/top-rated
 * @access  Public
 */
exports.getTopRatedDoctors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const doctors = await Doctor.find({
      approvalStatus: 'approved',
      'rating.average': { $gte: 4.0 }
    })
      .populate('user', 'firstName lastName')
      .populate('department', 'name')
      .sort({ 'rating.average': -1, 'rating.totalReviews': -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get top rated doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top rated doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;