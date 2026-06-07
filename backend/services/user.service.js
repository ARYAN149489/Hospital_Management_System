// backend/services/user.service.js
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const AppError = require('../utils/appError');

class UserService {
  async getPatientProfile(userId) {
    const patient = await Patient.findOne({ user: userId }).populate('user', '-password -refreshToken');
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }
    return patient;
  }

  async getDoctorProfile(userId) {
    const doctor = await Doctor.findOne({ user: userId }).populate('user', '-password -refreshToken').populate('department');
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }
    return doctor;
  }

  async updatePatientProfile(userId, updateData) {
    const userFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'];
    const patientFields = ['bloodGroup', 'allergies', 'chronicDiseases', 'emergencyContact', 'insurance'];

    const userUpdates = {};
    const patientUpdates = {};

    Object.keys(updateData).forEach(key => {
      if (userFields.includes(key)) {
        userUpdates[key] = updateData[key];
      } else if (patientFields.includes(key)) {
        patientUpdates[key] = updateData[key];
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true, runValidators: true });
    }

    if (Object.keys(patientUpdates).length > 0) {
      await Patient.findOneAndUpdate({ user: userId }, patientUpdates, { new: true, runValidators: true });
    }

    const patient = await Patient.findOne({ user: userId }).populate('user', '-password -refreshToken');
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }
    return patient;
  }

  async updateDoctorProfile(userId, updateData) {
    const userFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'];
    const doctorFields = [
      'specialization',
      'department',
      'bio',
      'qualifications',
      'medicalLicenseNumber',
      'medicalCouncilRegistration',
      'licenseValidUntil',
      'yearsOfExperience',
      'consultationFee',
      'consultationDuration',
      'availability',
      'servicesOffered',
      'languages',
      'maxAppointmentsPerDay',
      'allowOnlineConsultation',
      'allowEmergencyAppointments'
    ];

    const userUpdates = {};
    const doctorUpdates = {};

    Object.keys(updateData).forEach(key => {
      if (userFields.includes(key)) {
        userUpdates[key] = updateData[key];
      } else if (doctorFields.includes(key)) {
        doctorUpdates[key] = updateData[key];
      } else if (key === 'experience') {
        doctorUpdates.yearsOfExperience = Number(updateData.experience);
      } else if (key === 'about') {
        doctorUpdates.bio = updateData.about;
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true, runValidators: true });
    }

    if (Object.keys(doctorUpdates).length > 0) {
      await Doctor.findOneAndUpdate({ user: userId }, doctorUpdates, { new: true, runValidators: true });
    }

    const doctor = await Doctor.findOne({ user: userId }).populate('user', '-password -refreshToken').populate('department');
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }
    return doctor;
  }
}

module.exports = new UserService();
