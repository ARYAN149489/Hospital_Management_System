const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Patient = require('./models/Patient.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to database');
  
  // Find patient with user data
  const patients = await Patient.find()
    .populate('user', 'firstName lastName email phone')
    .limit(5);
  
  console.log('\n📋 All Patients with User Info:');
  patients.forEach((p, i) => {
    console.log(`\n${i+1}. Patient ID: ${p._id}`);
    console.log(`   User:`, p.user ? `${p.user.firstName} ${p.user.lastName}` : 'NULL');
    console.log(`   Has address:`, p.address ? 'YES' : 'NO');
    console.log(`   Has emergency:`, p.emergencyContact?.name ? 'YES' : 'NO');
  });
  
  // Get one with full data
  const goodPatient = await Patient.findOne({ 
    user: { $ne: null }
  })
    .populate('user', 'firstName lastName email phone');
  
  if (goodPatient) {
    console.log('\n\n✅ Sample Patient WITH User:');
    console.log(JSON.stringify(goodPatient, null, 2));
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
