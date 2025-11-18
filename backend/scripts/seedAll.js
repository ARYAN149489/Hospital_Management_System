// backend/scripts/seedAll.js
require('dotenv').config();
const { execSync } = require('child_process');

console.log('🚀 Starting complete database seeding...\n');
console.log('═══════════════════════════════════════════════════\n');

const runScript = (scriptName, description) => {
  try {
    console.log(`📌 ${description}...`);
    execSync(`node ${scriptName}`, { stdio: 'inherit' });
    console.log('\n═══════════════════════════════════════════════════\n');
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    process.exit(1);
  }
};

// Run scripts in order
runScript('scripts/seedDoctors.js', 'Step 1/3: Seeding Doctors');
runScript('scripts/seedPatients.js', 'Step 2/3: Seeding Patients');
runScript('scripts/seedDummyData.js', 'Step 3/3: Seeding Appointments, Prescriptions, Lab Tests & Medical Records');

console.log('🎉 All data seeded successfully!');
console.log('\n📊 Your database now contains:');
console.log('   ✅ 6 Sample Doctors');
console.log('   ✅ 5 Sample Patients');
console.log('   ✅ ~15 Appointments');
console.log('   ✅ ~10 Prescriptions');
console.log('   ✅ ~12 Lab Tests');
console.log('   ✅ ~10 Medical Records');
console.log('\n🔐 Login Credentials:');
console.log('   Doctors: doctor1@example.com to doctor6@example.com (Password: Doctor@123)');
console.log('   Patients: Check the output above for patient emails (Password: Patient@123)');
console.log('\n✨ You can now login and test the application!');
