// Test appointments endpoint response structure
const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('./models/Appointment.model');
const Patient = require('./models/Patient.model');
const Doctor = require('./models/Doctor.model');
const User = require('./models/User.model');

async function testAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find some appointments
    const appointments = await Appointment.find()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName phone email' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .limit(2);

    console.log('\n--- Raw Appointment Data (with virtuals) ---');
    appointments.forEach((apt, index) => {
      console.log(`\nAppointment ${index + 1}:`);
      console.log('  Patient ID:', apt.patient?._id);
      console.log('  Patient Name (virtual):', apt.patient?.name);
      console.log('  Patient Email (virtual):', apt.patient?.email);
      console.log('  Patient User:', apt.patient?.user?.firstName, apt.patient?.user?.lastName);
      console.log('  Doctor ID:', apt.doctor?._id);
      console.log('  Doctor UserId (virtual):', apt.doctor?.userId);
      console.log('  Doctor User:', apt.doctor?.user?.firstName, apt.doctor?.user?.lastName);
    });

    // Transform appointments
    const transformedAppointments = appointments.map(apt => {
      const aptObj = apt.toObject();
      return {
        ...aptObj,
        patientId: aptObj.patient,
        doctorId: aptObj.doctor,
        date: aptObj.appointmentDate,
        time: aptObj.appointmentTime
      };
    });

    console.log('\n--- Transformed Appointment Data ---');
    console.log(JSON.stringify(transformedAppointments, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAppointments();
