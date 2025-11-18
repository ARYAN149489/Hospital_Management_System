// Test multiple doctor logins
const axios = require('axios');

const doctorEmails = [
  'dr.rajesh.kumar@hospital.com',
  'dr.priya.sharma@medicareplus.com',
  'dr.amit.verma@medicareplus.com',
  'dr.sunita.patel@medicareplus.com',
  'dr.vikas.singh@medicareplus.com'
];

const testAllDoctorLogins = async () => {
  console.log('🧪 Testing multiple doctor logins...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const email of doctorEmails) {
    try {
      const response = await axios.post('http://localhost:5002/api/auth/login', {
        email: email,
        password: 'Doctor@123'
      });

      console.log(`✅ ${email} - Login successful`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${email} - Login failed: ${error.response?.data?.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful logins: ${successCount}/${doctorEmails.length}`);
  console.log(`❌ Failed logins: ${failCount}/${doctorEmails.length}`);
  console.log('='.repeat(60));
};

testAllDoctorLogins();
