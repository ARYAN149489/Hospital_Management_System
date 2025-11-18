// Test doctor login
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing doctor login...\n');
    
    const response = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'dr.rajesh.kumar@hospital.com',
      password: 'Doctor@123'
    });

    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user);
    console.log('Token received:', response.data.data.accessToken ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.response?.data);
  }
};

testLogin();
