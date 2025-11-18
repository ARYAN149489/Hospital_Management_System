// backend/routes/admin.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createDoctor,
  getAllDoctors,
  updateDoctorStatus,
  deleteDoctor
} = require('../controllers/adminController');

// All routes require authentication
router.use(protect);

// Create doctor account (admin only)
router.post('/create-doctor', createDoctor);

// Get all doctors
router.get('/doctors', getAllDoctors);

// Update doctor status (block/unblock)
router.patch('/doctors/:doctorId/status', updateDoctorStatus);

// Delete doctor account
router.delete('/doctors/:doctorId', deleteDoctor);

module.exports = router;