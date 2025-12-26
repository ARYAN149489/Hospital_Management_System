#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');
const Patient = require('./models/Patient.model');

const createTestPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare');
    console.log('✅ MongoDB Connected\n');

    const testEmail = 'test.patient@example.com';
    const testPassword = 'Patient@123';

    // Check if test patient exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('ℹ️  Test patient user already exists');
      
      // Update password
      existingUser.password = testPassword;
      existingUser.markModified('password');
      await existingUser.save();
      console.log('✅ Password updated to: Patient@123');
      
      // Check if Patient profile exists
      const existingPatient = await Patient.findOne({ user: existingUser._id });
      if (!existingPatient) {
        console.log('Creating Patient profile...');
        const patientCount = await Patient.countDocuments();
        await Patient.create({
          user: existingUser._id,
          patientId: `PAT${String(patientCount + 1000).padStart(6, '0')}`,
          bloodGroup: 'O+',
          emergencyContact: {
            name: 'Test Emergency Contact',
            relationship: 'Family',
            phone: '+91-9999999999'
          }
        });
        console.log('✅ Patient profile created');
      } else {
        console.log('✅ Patient profile already exists');
      }
    } else {
      // Create new test patient
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const user = await User.create({
        email: testEmail,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Patient',
        phone: '9999999999',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        role: 'patient',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          country: 'India'
        }
      });

      // Generate unique patient ID
      const patientCount = await Patient.countDocuments();
      const patientId = `PAT${String(patientCount + 1000).padStart(6, '0')}`;
      
      await Patient.create({
        user: user._id,
        patientId: patientId,
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '+91-9876543210'
        }
      });

      console.log('✅ Test patient created');
    }

    console.log('\n📧 Email: test.patient@example.com');
    console.log('🔑 Password: Patient@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestPatient();
