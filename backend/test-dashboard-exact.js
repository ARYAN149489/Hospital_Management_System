const mongoose = require('mongoose');
const Patient = require('./models/Patient.model');
const User = require('./models/User.model');
const Doctor = require('./models/Doctor.model');
const Appointment = require('./models/Appointment.model');
const { updateExpiredAppointments } = require('./utils/appointmentStatus');
require('dotenv').config();

async function testDashboardQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare-plus');
    console.log('✅ Connected to MongoDB\n');
    
    // Find patient
    const user = await User.findOne({ role: 'patient' });
    const patient = await Patient.findOne({ user: user._id });
    
    console.log('Testing Dashboard Query for Patient:', patient._id);
    console.log('Current Server Time:', new Date().toISOString());
    console.log('');
    
    // EXACT query from getDashboard controller
    let upcomingAppointments = await Appointment.find({
      patient: patient._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ appointmentDate: 1 })
      .limit(5);

    console.log('📅 Found appointments BEFORE updateExpiredAppointments:', upcomingAppointments.length);
    upcomingAppointments.forEach(apt => {
      console.log(`  - ${apt._id} | ${apt.appointmentDate} | ${apt.appointmentTime} | Status: ${apt.status}`);
    });
    
    // Call updateExpiredAppointments
    console.log('\n🔄 Calling updateExpiredAppointments...');
    upcomingAppointments = await updateExpiredAppointments(upcomingAppointments);
    
    console.log('\n📅 Appointments AFTER updateExpiredAppointments:', upcomingAppointments.length);
    upcomingAppointments.forEach(apt => {
      console.log(`  - ${apt._id} | ${apt.appointmentDate} | ${apt.appointmentTime} | Status: ${apt.status}`);
    });
    
    // Filter (exact code from controller)
    const beforeFilterCount = upcomingAppointments.length;
    upcomingAppointments = upcomingAppointments.filter(apt => {
      const isValid = apt.status === 'scheduled' || apt.status === 'confirmed';
      if (!isValid) {
        console.log(`  ❌ Filtering out: ${apt._id} Status: ${apt.status}`);
      }
      return isValid;
    });
    
    console.log('\n📅 Appointments AFTER filtering:', upcomingAppointments.length);
    console.log(`   (Filtered out: ${beforeFilterCount - upcomingAppointments.length})`);
    
    if (upcomingAppointments.length === 0) {
      console.log('\n❌❌❌ PROBLEM: All appointments were filtered out!');
      console.log('This is why the dashboard shows empty!');
    } else {
      console.log('\n✅✅✅ SUCCESS: Appointments should display');
      upcomingAppointments.forEach(apt => {
        console.log(`  - ${apt._id} | ${apt.appointmentDate} | ${apt.appointmentTime} | Status: ${apt.status}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDashboardQuery();
