#!/bin/bash

echo "🔍 Verifying Patient Names in Appointments"
echo "=========================================="
echo ""

cd /Users/aryankansal/Desktop/Soft/my-react-app/backend

node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User.model');
  const Patient = require('./models/Patient.model');
  const Appointment = require('./models/Appointment.model');
  
  console.log('📅 Fetching sample appointments with populated patient data...\n');
  
  const appointments = await Appointment.find({})
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName phone email'
      }
    })
    .limit(10);
  
  if (appointments.length === 0) {
    console.log('❌ No appointments found!');
    process.exit(1);
  }
  
  console.log('✅ Found', appointments.length, 'appointments\n');
  console.log('📋 Sample Appointments:\n');
  
  appointments.forEach((apt, index) => {
    const patientName = apt.patient?.user?.firstName && apt.patient?.user?.lastName
      ? \`\${apt.patient.user.firstName} \${apt.patient.user.lastName}\`
      : apt.patient?.user?.fullName || 'Unknown';
    
    const phone = apt.patient?.user?.phone || 'N/A';
    const date = apt.appointmentDate.toDateString();
    const time = apt.appointmentTime;
    const status = apt.status;
    
    console.log(\`\${index + 1}. \${patientName}\`);
    console.log(\`   Phone: \${phone}\`);
    console.log(\`   Date: \${date} at \${time}\`);
    console.log(\`   Status: \${status}\`);
    console.log('');
  });
  
  // Check for any appointments with missing patient data
  const invalidAppointments = await Appointment.find({
    patient: null
  }).countDocuments();
  
  if (invalidAppointments > 0) {
    console.log(\`⚠️  Warning: Found \${invalidAppointments} appointments with no patient assigned\`);
  } else {
    console.log('✅ All appointments have valid patient assignments');
  }
  
  console.log('\n========================================');
  console.log('✅ Verification Complete!');
  console.log('');
  console.log('Now check your browser:');
  console.log('1. Hard refresh (Cmd+Shift+R)');
  console.log('2. Login as doctor1@example.com');
  console.log('3. Go to My Appointments');
  console.log('4. You should see patient names like:');
  console.log('   - Arjun Verma');
  console.log('   - Priya Kapoor');
  console.log('   - Vikram Singh');
  console.log('   - etc.');
  console.log('');
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
