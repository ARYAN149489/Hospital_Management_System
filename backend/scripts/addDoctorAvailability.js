// Script to add availability schedules to all doctors
const mongoose = require('mongoose');
require('dotenv').config();

async function addDoctorAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User.model.js');
    const Doctor = require('../models/Doctor.model.js');
    
    // Default availability: Monday-Saturday, 9 AM - 5 PM (all doctors available all days)
    const defaultAvailability = [
      {
        day: 'monday',
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'tuesday',
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'wednesday',
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'thursday',
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'friday',
        slots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'saturday',
        slots: [
          { startTime: '10:00', endTime: '13:00' }
        ],
        isAvailable: true
      },
      {
        day: 'sunday',
        slots: [],
        isAvailable: false
      }
    ];

    // Update ALL doctors to have consistent availability (overwrite existing)
    const result = await Doctor.updateMany(
      { approvalStatus: 'approved' },
      { $set: { availability: defaultAvailability } }
    );

    console.log('✅ Updated', result.modifiedCount, 'doctors with default availability');

    // Show updated doctors
    const doctors = await Doctor.find({ approvalStatus: 'approved' })
      .populate('user', 'firstName lastName')
      .select('availability');

    console.log('\n📊 Doctors with availability:');
    doctors.forEach(doc => {
      const name = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Unknown';
      const availableDays = doc.availability?.filter(a => a.isAvailable).map(a => a.day);
      console.log(`- ${name}: Available on ${availableDays?.join(', ') || 'No days'}`);
    });

    console.log('\n🎉 All doctors now have availability schedules!');
    console.log('Schedule: Mon-Fri 9AM-12PM, 2PM-5PM | Sat 10AM-1PM | Sun Off');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDoctorAvailability();
