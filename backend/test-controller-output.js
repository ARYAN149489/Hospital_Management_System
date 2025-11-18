const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Patient = require('./models/Patient.model');
const Doctor = require('./models/Doctor.model');
const Appointment = require('./models/Appointment.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database\n');
  
  // Simulate the doctor controller logic
  const doctor = await Doctor.findOne();
  
  const patientIds = await Appointment.distinct('patient', {
    doctor: doctor._id
  });
  
  console.log(`Found ${patientIds.length} unique patients\n`);
  
  const patients = await Patient.find({ _id: { $in: patientIds } })
    .populate('user', 'firstName lastName email phone address dateOfBirth gender')
    .select('bloodGroup allergies chronicDiseases currentMedications emergencyContact')
    .limit(2);
  
  console.log('📋 Sample Patient Data (as returned by backend):\n');
  patients.forEach((p, i) => {
    console.log(`Patient ${i+1}:`);
    console.log(`  Name: ${p.user?.firstName} ${p.user?.lastName}`);
    console.log(`  Email: ${p.user?.email}`);
    console.log(`  Phone: ${p.user?.phone}`);
    console.log(`  DOB: ${p.user?.dateOfBirth}`);
    console.log(`  Gender: ${p.user?.gender}`);
    console.log(`  Address:`, p.user?.address);
    console.log(`  Blood Group: ${p.bloodGroup}`);
    console.log(`  Allergies:`, p.allergies);
    console.log(`  Chronic Diseases:`, p.chronicDiseases);
    console.log(`  Current Meds:`, p.currentMedications);
    console.log(`  Emergency Contact:`, p.emergencyContact);
    console.log('\n');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
