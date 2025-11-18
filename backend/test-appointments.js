// Quick test script for appointments endpoint
const axios = require('axios');

async function testAppointments() {
  console.log('🧪 Testing appointments endpoint...\n');
  
  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'aryankansal100@gmail.com',
      password: 'Aryan@123'
    }, { timeout: 10000 });
    
    console.log('✅ Login successful');
    console.log('Response structure:', Object.keys(loginResponse.data));
    
    const accessToken = loginResponse.data.data?.accessToken;
    if (!accessToken) {
      console.error('❌ No access token in response!');
      console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    console.log('✅ Got access token:', accessToken.substring(0, 20) + '...\n');
    
    // Step 2: Get appointments
    console.log('Step 2: Fetching appointments...');
    const appointmentsResponse = await axios.get('http://localhost:5002/api/appointments/my-appointments', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: 10000
    });
    
    console.log('✅ Appointments fetched successfully!');
    console.log('Response:', JSON.stringify(appointmentsResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('Message:', error.message);
    }
  }
}

testAppointments();
