const mongoose = require('mongoose');
const User = require('./models/User.model');
const Patient = require('./models/Patient.model');
const Appointment = require('./models/Appointment.model');
require('dotenv').config();

async function checkDashboardData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare-plus');
    console.log('✅ Connected to MongoDB\n');
    
    // Find the logged-in user (Aryan)
    const user = await User.findOne({ email: 'aryankansal100@gmail.com' });
    if (!user) {
      console.log('❌ User aryankansal100@gmail.com not found');
      process.exit(1);
    }
    
    console.log('✅ User found:', user.firstName, user.lastName);
    console.log('   User ID:', user._id);
    console.log('   Role:', user.role);
    console.log('');
    
    // Find patient profile
    const patient = await Patient.findOne({ user: user._id });
    if (!patient) {
      console.log('❌ Patient profile not found for this user');
      process.exit(1);
    }
    
    console.log('✅ Patient profile found');
    console.log('   Patient ID:', patient._id);
    console.log('');
    
    // Check upcoming appointments
    const now = new Date();
    console.log('📅 Current time:', now);
    console.log('📅 Current time ISO:', now.toISOString());
    console.log('');
    
    const upcomingQuery = {
      patient: patient._id,
      appointmentDate: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] }
    };
    
    console.log('🔍 Query for upcoming appointments:');
    console.log(JSON.stringify(upcomingQuery, null, 2));
    console.log('');
    
    const upcomingAppointments = await Appointment.find(upcomingQuery)
      .populate({
        path: 'doctor',
        select: 'specialization',
        populate: { path: 'user', select: 'firstName lastName' }
      });
    
    console.log('📊 Found', upcomingAppointments.length, 'upcoming appointments');
    console.log('');
    
    if (upcomingAppointments.length > 0) {
      upcomingAppointments.forEach((apt, i) => {
        console.log(`Appointment ${i+1}:`);
        console.log('  ID:', apt._id);
        console.log('  Date:', apt.appointmentDate);
        console.log('  Date ISO:', apt.appointmentDate.toISOString());
        console.log('  Time:', apt.appointmentTime);
        console.log('  Status:', apt.status);
        console.log('  Doctor:', apt.doctor?.user?.firstName, apt.doctor?.user?.lastName);
        console.log('  Is future?', apt.appointmentDate >= now);
        console.log('');
      });
    } else {
      console.log('❌ No upcoming appointments found!');
      console.log('');
      
      // Check all appointments for this patient
      const allAppointments = await Appointment.find({ patient: patient._id });
      console.log('📊 Total appointments for patient:', allAppointments.length);
      if (allAppointments.length > 0) {
        console.log('\nAll appointments:');
        allAppointments.forEach((apt, i) => {
          const isFuture = apt.appointmentDate >= now;
          const matchesStatus = ['scheduled', 'confirmed'].includes(apt.status);
          console.log(`  ${i+1}. Date: ${apt.appointmentDate.toISOString()} | Time: ${apt.appointmentTime} | Status: ${apt.status} | Future: ${isFuture} | Status OK: ${matchesStatus}`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDashboardData();
