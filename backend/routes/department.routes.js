// backend/routes/department.routes.js
const express = require('express');
const router = express.Router();
const Department = require('../models/Department.model');
const Doctor = require('../models/Doctor.model');
const { query, param } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/departments
 * @desc    Get all active departments
 * @access  Public
 */
router.get(
  '/',
  [
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('featured must be a boolean'),
    query('emergency')
      .optional()
      .isBoolean()
      .withMessage('emergency must be a boolean'),
    validate
  ],
  async (req, res) => {
    try {
      const { featured, emergency } = req.query;

      const query = { isActive: true };

      if (featured === 'true') {
        query.isFeatured = true;
      }

      if (emergency === 'true') {
        query.isEmergency = true;
      }

      const departments = await Department.find(query)
        .populate('headOfDepartment', 'name specialization')
        .select('-__v')
        .sort({ name: 1 });

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
        data: departmentsWithStats
      });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get departments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid department ID'),
    validate
  ],
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.id)
        .populate('headOfDepartment', 'name specialization email phone');

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      if (!department.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Department is not available'
        });
      }

      // Get active doctors in this department
      const doctors = await Doctor.find({
        department: department._id,
        status: 'active'
      })
        .populate('userId', 'firstName lastName')
        .select('name specialization rating totalRatings experience consultationFee');

      res.status(200).json({
        success: true,
        data: {
          department,
          doctors,
          doctorCount: doctors.length
        }
      });
    } catch (error) {
      console.error('Get department error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get department',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   GET /api/departments/search
 * @desc    Search departments
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    validate
  ],
  async (req, res) => {
    try {
      const { q } = req.query;

      const departments = await Department.find({
        isActive: true,
        $or: [
          { name: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { services: { $elemMatch: { $regex: q, $options: 'i' } } },
          { specializations: { $elemMatch: { $regex: q, $options: 'i' } } }
        ]
      })
        .populate('headOfDepartment', 'name specialization')
        .select('name code description services isEmergency')
        .limit(10);

      res.status(200).json({
        success: true,
        count: departments.length,
        data: departments
      });
    } catch (error) {
      console.error('Search departments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search departments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;