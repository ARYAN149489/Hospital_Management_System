// backend/controllers/adminDepartment.controller.js
const Department = require('../models/Department.model');
const Doctor = require('../models/Doctor.model');
const Admin = require('../models/Admin.model');

/**
 * @desc    Create new department
 * @route   POST /api/admin/departments
 * @access  Private (Admin)
 */
exports.createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      headOfDepartment,
      services,
      operatingHours,
      isEmergency,
      bedCapacity,
      equipment,
      specializations,
      insuranceAccepted,
      contactNumber,
      email,
      location
    } = req.body;

    // Check if department code already exists
    const existingDept = await Department.findOne({ code });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code already exists'
      });
    }

    // Create department
    const department = await Department.create({
      name,
      code,
      description,
      headOfDepartment,
      services,
      operatingHours,
      isEmergency,
      bedCapacity,
      equipment,
      specializations,
      insuranceAccepted,
      contactNumber,
      email,
      location
    });

    // Populate head of department
    await department.populate('headOfDepartment', 'name specialization');

    // Log activity
    const admin = await Admin.findOne({ userId: req.userId });
    admin.activityLog.unshift({
      action: 'created_department',
      description: `Created department ${name} (${code})`,
      targetModel: 'Department',
      targetId: department._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all departments
 * @route   GET /api/admin/departments
 * @access  Private (Admin)
 */
exports.getAllDepartments = async (req, res) => {
  try {
    const { isActive, isEmergency, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isEmergency !== undefined) {
      query.isEmergency = isEmergency === 'true';
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const departments = await Department.find(query)
      .populate('headOfDepartment', 'name specialization')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Department.countDocuments(query);

    // Get doctor count for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({
          department: dept._id,
          status: 'active'
        });

        return {
          ...dept.toObject(),
          doctorCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithStats.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: departmentsWithStats
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get department by ID
 * @route   GET /api/admin/departments/:id
 * @access  Private (Admin)
 */
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'name specialization email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get doctors in this department
    const doctors = await Doctor.find({
      department: department._id,
      status: 'active'
    }).select('name specialization rating totalRatings');

    // Get statistics
    const totalDoctors = doctors.length;
    const totalBeds = department.bedCapacity?.total || 0;
    const availableBeds = department.bedCapacity?.available || 0;

    res.status(200).json({
      success: true,
      data: {
        department,
        doctors,
        statistics: {
          totalDoctors,
          totalBeds,
          availableBeds,
          occupancyRate: totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/admin/departments/:id
 * @access  Private (Admin)
 */
exports.updateDepartment = async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'description',
      'headOfDepartment',
      'services',
      'operatingHours',
      'isEmergency',
      'bedCapacity',
      'equipment',
      'specializations',
      'insuranceAccepted',
      'contactNumber',
      'email',
      'location',
      'isActive',
      'isFeatured'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('headOfDepartment', 'name specialization');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Log activity
    const admin = await Admin.findOne({ userId: req.userId });
    admin.activityLog.unshift({
      action: 'updated_department',
      description: `Updated department ${department.name}`,
      targetModel: 'Department',
      targetId: department._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete department
 * @route   DELETE /api/admin/departments/:id
 * @access  Private (Admin)
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has doctors
    const doctorCount = await Doctor.countDocuments({
      department: department._id
    });

    if (doctorCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${doctorCount} doctor(s) are assigned to this department. Please reassign them first.`
      });
    }

    await department.deleteOne();

    // Log activity
    const admin = await Admin.findOne({ userId: req.userId });
    admin.activityLog.unshift({
      action: 'deleted_department',
      description: `Deleted department ${department.name}`,
      targetModel: 'Department',
      targetId: department._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update department status
 * @route   PATCH /api/admin/departments/:id/status
 * @access  Private (Admin)
 */
exports.updateDepartmentStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Log activity
    const admin = await Admin.findOne({ userId: req.userId });
    admin.activityLog.unshift({
      action: isActive ? 'activated_department' : 'deactivated_department',
      description: `${isActive ? 'Activated' : 'Deactivated'} department ${department.name}`,
      targetModel: 'Department',
      targetId: department._id,
      timestamp: new Date()
    });
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: department
    });
  } catch (error) {
    console.error('Update department status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update department status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update bed capacity
 * @route   PATCH /api/admin/departments/:id/beds
 * @access  Private (Admin)
 */
exports.updateBedCapacity = async (req, res) => {
  try {
    const { total, available } = req.body;

    if (available > total) {
      return res.status(400).json({
        success: false,
        message: 'Available beds cannot exceed total beds'
      });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.bedCapacity = {
      total,
      available,
      occupied: total - available
    };

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Bed capacity updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update bed capacity error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update bed capacity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;