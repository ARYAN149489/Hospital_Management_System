#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

const resetTestPatientPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare');
    console.log('✅ MongoDB Connected\n');

    const testEmail = 'test.patient@example.com';
    const testPassword = 'Patient@123';

    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('Current password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');

    // Set password as plain text - the pre-save hook will hash it
    user.password = testPassword;
    user.markModified('password'); // Explicitly mark as modified
    const savedUser = await user.save();

    console.log('✅ Password reset successful');
    console.log('New password hash:', savedUser.password ? savedUser.password.substring(0, 20) + '...' : 'STILL NO PASSWORD');
    console.log('\n📧 Email: test.patient@example.com');
    console.log('🔑 Password: Patient@123');
    
    // Verify the password works
    if (savedUser.password) {
      const isMatch = await bcrypt.compare(testPassword, savedUser.password);
      console.log('\n🔍 Password verification:', isMatch ? '✅ WORKS' : '❌ FAILED');
    } else {
      console.log('\n❌ Password was not saved!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetTestPatientPassword();
