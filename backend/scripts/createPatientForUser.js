// Create Patient record for aryankansal100@gmail.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');

const createPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const user = await User.findOne({ email: 'aryankansal100@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);

    const existingPatient = await Patient.findOne({ user: user._id });
    if (existingPatient) {
      console.log('✅ Patient record already exists');
      return;
    }

    const patient = await Patient.create({
      user: user._id,
      patientId: 'PAT' + Date.now(),
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '+91-9876543210'
      },
      medicalHistory: {
        allergies: [],
        chronicDiseases: [],
        surgeries: []
      }
    });

    console.log('✅ Patient record created:', patient.patientId);
    console.log('✅ Now you can view appointments!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

createPatient();
