const mongoose = require('mongoose');
const Patient = require('./models/Patient.model');
const User = require('./models/User.model');
const Doctor = require('./models/Doctor.model');
const Appointment = require('./models/Appointment.model');
require('dotenv').config();

async function testDashboardAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare-plus');
    console.log('✅ Connected to MongoDB\n');
    
    // Find a patient with user role
    const user = await User.findOne({ role: 'patient' });
    if (!user) {
      console.log('❌ No patient user found');
      process.exit(0);
    }
    
    console.log('Patient User:', user.firstName, user.lastName);
    console.log('User ID:', user._id);
    
    const patient = await Patient.findOne({ user: user._id });
    if (!patient) {
      console.log('❌ No patient profile found');
      process.exit(0);
    }
    
    console.log('Patient Profile ID:', patient._id);
    
    // Check current date/time
    const now = new Date();
    console.log('\n📅 Current Date/Time:', now);
    console.log('ISO String:', now.toISOString());
    
    // Query 1: Dashboard query (upcoming appointments)
    console.log('\n=== DASHBOARD QUERY (getDashboard) ===');
    const dashboardAppointments = await Appointment.find({
      patient: patient._id,
      appointmentDate: { $gte: now },
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
    
    console.log('Dashboard upcoming appointments:', dashboardAppointments.length);
    dashboardAppointments.forEach((apt, i) => {
      console.log(`\n  Appointment ${i+1}:`);
      console.log('    ID:', apt._id);
      console.log('    Date:', apt.appointmentDate);
      console.log('    Date ISO:', apt.appointmentDate.toISOString());
      console.log('    Time:', apt.appointmentTime);
      console.log('    Status:', apt.status);
      console.log('    Type:', apt.appointmentType);
      if (apt.doctor?.user) {
        console.log('    Doctor:', apt.doctor.user.firstName, apt.doctor.user.lastName);
      }
    });
    
    // Query 2: Appointments tab query (all appointments)
    console.log('\n\n=== APPOINTMENTS TAB QUERY (getMyAppointments) ===');
    const allAppointments = await Appointment.find({
      patient: patient._id
    })
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ appointmentDate: -1 });
    
    console.log('Total appointments:', allAppointments.length);
    
    const upcoming = allAppointments.filter(a => 
      (a.status === 'scheduled' || a.status === 'confirmed') &&
      new Date(a.appointmentDate) >= now
    );
    console.log('Upcoming (filtered):', upcoming.length);
    
    console.log('\nAll appointments:');
    allAppointments.forEach((apt, i) => {
      const isPast = new Date(apt.appointmentDate) < now;
      const isUpcoming = (apt.status === 'scheduled' || apt.status === 'confirmed') && !isPast;
      console.log(`\n  ${i+1}. ${isUpcoming ? '🟢 UPCOMING' : '🔴 PAST/OTHER'}`);
      console.log('    ID:', apt._id);
      console.log('    Date:', apt.appointmentDate);
      console.log('    Time:', apt.appointmentTime);
      console.log('    Status:', apt.status);
      console.log('    Is past?', isPast);
      if (apt.doctor?.user) {
        console.log('    Doctor:', apt.doctor.user.firstName, apt.doctor.user.lastName);
      }
    });
    
    // Check if there's a date comparison issue
    console.log('\n\n=== DATE COMPARISON ANALYSIS ===');
    const testAppointments = await Appointment.find({ patient: patient._id });
    testAppointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const comparison = aptDate >= now;
      console.log(`\nAppointment ${apt._id}:`);
      console.log('  DB Date:', apt.appointmentDate);
      console.log('  Parsed Date:', aptDate);
      console.log('  Now:', now);
      console.log('  aptDate >= now:', comparison);
      console.log('  Status:', apt.status);
      console.log('  Matches dashboard query:', comparison && (apt.status === 'scheduled' || apt.status === 'confirmed'));
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDashboardAppointments();
