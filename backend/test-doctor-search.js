// Test script for doctor search functionality
const axios = require('axios');

async function testDoctorSearch() {
  console.log('🧪 Testing Doctor Search Functionality...\n');
  
  try {
    // Test 1: Search by specialization
    console.log('Test 1: Search by specialization (Cardiology)');
    const test1 = await axios.get('http://localhost:5002/api/doctors/search', {
      params: { query: 'Cardiology' }
    });
    console.log('✅ Found', test1.data.count, 'doctors');
    if (test1.data.data.length > 0) {
      console.log('   Sample:', test1.data.data[0].name, '-', test1.data.data[0].specialization);
    }
    console.log();

    // Test 2: Search by doctor first name
    console.log('Test 2: Search by first name (Priya)');
    const test2 = await axios.get('http://localhost:5002/api/doctors/search', {
      params: { query: 'Priya' }
    });
    console.log('✅ Found', test2.data.count, 'doctors');
    if (test2.data.data.length > 0) {
      test2.data.data.forEach(doc => {
        console.log('   -', doc.name, '-', doc.specialization);
      });
    }
    console.log();

    // Test 3: Search by doctor last name
    console.log('Test 3: Search by last name (Sharma)');
    const test3 = await axios.get('http://localhost:5002/api/doctors/search', {
      params: { query: 'Sharma' }
    });
    console.log('✅ Found', test3.data.count, 'doctors');
    if (test3.data.data.length > 0) {
      test3.data.data.forEach(doc => {
        console.log('   -', doc.name, '-', doc.specialization);
      });
    }
    console.log();

    // Test 4: Search by partial name
    console.log('Test 4: Search by partial name (Anj)');
    const test4 = await axios.get('http://localhost:5002/api/doctors/search', {
      params: { query: 'Anj' }
    });
    console.log('✅ Found', test4.data.count, 'doctors');
    if (test4.data.data.length > 0) {
      test4.data.data.forEach(doc => {
        console.log('   -', doc.name, '-', doc.specialization);
      });
    }
    console.log();

    // Test 5: Search by specialization partial
    console.log('Test 5: Search by partial specialization (Derma)');
    const test5 = await axios.get('http://localhost:5002/api/doctors/search', {
      params: { query: 'Derma' }
    });
    console.log('✅ Found', test5.data.count, 'doctors');
    if (test5.data.data.length > 0) {
      test5.data.data.forEach(doc => {
        console.log('   -', doc.name, '-', doc.specialization);
      });
    }
    console.log();

    console.log('🎉 All search tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during search test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testDoctorSearch();
