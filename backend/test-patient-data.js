const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Patient = require('./models/Patient.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database');
  
  const patient = await Patient.findOne()
    .populate('user', 'firstName lastName email phone')
    .select('dateOfBirth gender bloodGroup allergies chronicConditions address emergencyContact medicalHistory currentMedications');
  
  console.log('\n📋 Sample Patient Data:');
  console.log(JSON.stringify(patient, null, 2));
  
  console.log('\n🔍 Patient has these fields:');
  console.log('- address:', patient.address ? 'YES' : 'NO');
  console.log('- emergencyContact:', patient.emergencyContact ? 'YES' : 'NO');
  console.log('- medicalHistory:', patient.medicalHistory ? 'YES' : 'NO');
  console.log('- currentMedications:', patient.currentMedications ? 'YES' : 'NO');
  console.log('- allergies:', patient.allergies ? 'YES' : 'NO');
  console.log('- chronicConditions:', patient.chronicConditions ? 'YES' : 'NO');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
