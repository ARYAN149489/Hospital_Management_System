// Quick test to check appointments in database
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testAppointments = async () => {
  try {
    await connectDB();

    const Appointment = require('./models/Appointment.model');
    
    // Test date
    const testDate = new Date('2025-11-10');
    testDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(testDate);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log('\n📅 Testing appointments for Nov 10, 2025');
    console.log('Date range:', testDate, 'to', nextDay);
    
    const appointments = await Appointment.find({
      appointmentDate: { $gte: testDate, $lt: nextDay }
    }).limit(5);

    console.log(`\n✅ Found ${appointments.length} appointments`);

    if (appointments.length > 0) {
      console.log('\n📋 Sample appointment:');
      const apt = appointments[0];
      console.log({
        id: apt.appointmentId,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        status: apt.status,
        hasTime: !!apt.appointmentTime,
        hasDate: !!apt.appointmentDate
      });

      // Check for appointments with missing fields
      const invalidAppointments = await Appointment.find({
        $or: [
          { appointmentDate: { $exists: false } },
          { appointmentTime: { $exists: false } },
          { appointmentDate: null },
          { appointmentTime: null }
        ]
      }).countDocuments();

      if (invalidAppointments > 0) {
        console.log(`\n⚠️  Warning: Found ${invalidAppointments} appointments with missing date/time fields`);
      } else {
        console.log('\n✅ All appointments have valid date/time fields');
      }
    } else {
      console.log('\n⚠️  No appointments found for this date');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

testAppointments();
