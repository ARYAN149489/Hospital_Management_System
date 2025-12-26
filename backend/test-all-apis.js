// backend/test-all-apis.js
const axios = require('axios');
const colors = require('colors');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5002';
const API_URL = `${BASE_URL}/api`;

// Test results tracker
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test user credentials
let adminToken = '';
let doctorToken = '';
let patientToken = '';
let testDoctorId = '';
let testPatientId = '';
let testAppointmentId = '';
let testPrescriptionId = '';
let testDepartmentId = '';

// Helper function to log test results
const logTest = (testName, passed, response = null, error = null) => {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✓ ${testName}`.green);
    if (response && response.data) {
      console.log(`  Response: ${JSON.stringify(response.data).substring(0, 100)}...`.gray);
    }
  } else {
    failedTests++;
    console.log(`✗ ${testName}`.red);
    if (error) {
      console.log(`  Error: ${error.message}`.red);
      if (error.response) {
        console.log(`  Status: ${error.response.status}`.red);
        console.log(`  Data: ${JSON.stringify(error.response.data)}`.red);
      }
    }
  }
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {},
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    if (method === 'get') {
      config.params = data;
    } else {
      config.data = data;
    }
  }

  return axios(config);
};

// Test sections
const testHealthCheck = async () => {
  console.log('\n=== HEALTH CHECK TESTS ==='.cyan.bold);
  
  try {
    const response = await apiCall('get', '/health');
    logTest('GET /api/health', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/health', false, null, error);
  }
};

const testAuthRoutes = async () => {
  console.log('\n=== AUTHENTICATION TESTS ==='.cyan.bold);

  // Test patient registration
  try {
    const patientData = {
      email: `patient_${Date.now()}@test.com`,
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient',
      phone: '1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: '123 Test St',
      bloodGroup: 'O+',
      emergencyContact: '9876543210'
    };
    const response = await apiCall('post', '/auth/register', patientData);
    testPatientId = response.data.user?._id;
    logTest('POST /api/auth/register (Patient)', response.status === 201, response);
  } catch (error) {
    logTest('POST /api/auth/register (Patient)', false, null, error);
  }

  // Test patient login
  try {
    const loginData = {
      email: 'test.patient@example.com',
      password: 'Patient@123'
    };
    const response = await apiCall('post', '/auth/login', loginData);
    if (response.data.data?.accessToken) {
      patientToken = response.data.data.accessToken;
    }
    logTest('POST /api/auth/login (Patient)', response.status === 200, response);
  } catch (error) {
    logTest('POST /api/auth/login (Patient)', false, null, error);
  }

  // Test doctor login
  try {
    const loginData = {
      email: 'dr.rajesh.kumar@hospital.com',
      password: 'Doctor@123'
    };
    const response = await apiCall('post', '/auth/login', loginData);
    if (response.data.data?.accessToken) {
      doctorToken = response.data.data.accessToken;
      testDoctorId = response.data.data.user?.id;
    }
    logTest('POST /api/auth/login (Doctor)', response.status === 200, response);
  } catch (error) {
    logTest('POST /api/auth/login (Doctor)', false, null, error);
  }

  // Test admin login
  try {
    const loginData = {
      email: 'admin@medicareplus.com',
      password: 'Admin@123'
    };
    const response = await apiCall('post', '/auth/login', loginData);
    if (response.data.data?.accessToken) {
      adminToken = response.data.data.accessToken;
    }
    logTest('POST /api/auth/login (Admin)', response.status === 200, response);
  } catch (error) {
    logTest('POST /api/auth/login (Admin)', false, null, error);
  }

  // Test get current user
  if (adminToken) {
    try {
      const response = await apiCall('get', '/auth/me', null, adminToken);
      logTest('GET /api/auth/me (Admin)', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/auth/me (Admin)', false, null, error);
    }

    // Test get profile
    try {
      const response = await apiCall('get', '/auth/profile', null, adminToken);
      logTest('GET /api/auth/profile (Admin)', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/auth/profile (Admin)', false, null, error);
    }
  }
  
  if (patientToken) {
    try {
      const response = await apiCall('get', '/auth/me', null, patientToken);
      logTest('GET /api/auth/me (Patient)', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/auth/me (Patient)', false, null, error);
    }
  }
  
  if (doctorToken) {
    try {
      const response = await apiCall('get', '/auth/me', null, doctorToken);
      logTest('GET /api/auth/me (Doctor)', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/auth/me (Doctor)', false, null, error);
    }
  }
};

const testDoctorRoutes = async () => {
  console.log('\n=== DOCTOR ROUTES TESTS ==='.cyan.bold);

  // Test get all doctors
  try {
    const response = await apiCall('get', '/doctors');
    if (response.data.data && response.data.data.length > 0) {
      // Use the first doctor's profile ID (not user ID)
      testDoctorId = response.data.data[0]._id;
    }
    logTest('GET /api/doctors', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctors', false, null, error);
  }

  // Test get doctors with filters
  try {
    const response = await apiCall('get', '/doctors', {
      page: 1,
      limit: 10,
      specialization: 'Cardiology'
    });
    logTest('GET /api/doctors (with filters)', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctors (with filters)', false, null, error);
  }

  // Test search doctors
  try {
    const response = await apiCall('get', '/doctors/search', { query: 'cardio' });
    logTest('GET /api/doctors/search', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctors/search', false, null, error);
  }

  // Test get doctor by ID
  if (testDoctorId) {
    try {
      const response = await apiCall('get', `/doctors/${testDoctorId}`);
      logTest('GET /api/doctors/:id', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/doctors/:id', false, null, error);
    }
  }
};

const testPatientRoutes = async () => {
  console.log('\n=== PATIENT ROUTES TESTS ==='.cyan.bold);

  if (!patientToken) {
    console.log('⚠ Skipping patient routes - no patient token available'.yellow);
    return;
  }

  // Test get patient profile
  try {
    const response = await apiCall('get', '/patients/profile', null, patientToken);
    logTest('GET /api/patients/profile', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/profile', false, null, error);
  }

  // Test update patient profile
  try {
    const updateData = {
      phone: '9876543210',
      address: '456 Updated St'
    };
    const response = await apiCall('put', '/patients/profile', updateData, patientToken);
    logTest('PUT /api/patients/profile', response.status === 200, response);
  } catch (error) {
    logTest('PUT /api/patients/profile', false, null, error);
  }

  // Test get patient dashboard
  try {
    const response = await apiCall('get', '/patients/dashboard', null, patientToken);
    logTest('GET /api/patients/dashboard', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/dashboard', false, null, error);
  }

  // Test get medical records
  try {
    const response = await apiCall('get', '/patients/medical-records', null, patientToken);
    logTest('GET /api/patients/medical-records', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/medical-records', false, null, error);
  }

  // Test get appointment history
  try {
    const response = await apiCall('get', '/patients/appointments/history', null, patientToken);
    logTest('GET /api/patients/appointments/history', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/appointments/history', false, null, error);
  }

  // Test get prescriptions
  try {
    const response = await apiCall('get', '/patients/prescriptions', null, patientToken);
    logTest('GET /api/patients/prescriptions', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/prescriptions', false, null, error);
  }

  // Test get lab tests
  try {
    const response = await apiCall('get', '/patients/lab-tests', null, patientToken);
    logTest('GET /api/patients/lab-tests', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/patients/lab-tests', false, null, error);
  }
};

const testAppointmentRoutes = async () => {
  console.log('\n=== APPOINTMENT ROUTES TESTS ==='.cyan.bold);

  if (!patientToken || !testDoctorId) {
    console.log('⚠ Skipping appointment routes - missing patient token or doctor ID'.yellow);
    return;
  }

  // Test book appointment
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    // Use a random time to avoid conflicts
    const randomHour = 9 + Math.floor(Math.random() * 8); // 9-16 (9am-4pm)
    const randomMinute = Math.random() < 0.5 ? '00' : '30';
    const time = `${randomHour.toString().padStart(2, '0')}:${randomMinute}`;
    
    const appointmentData = {
      doctorId: testDoctorId,
      date: dateStr,
      time: time,
      type: 'in-person',
      reason: 'Regular checkup for general health assessment'
    };
    const response = await apiCall('post', '/appointments', appointmentData, patientToken);
    if (response.data.appointment) {
      testAppointmentId = response.data.appointment._id;
    }
    logTest('POST /api/appointments', response.status === 201, response);
  } catch (error) {
    logTest('POST /api/appointments', false, null, error);
  }

  // Test get my appointments (patient)
  try {
    const response = await apiCall('get', '/appointments/my-appointments', null, patientToken);
    logTest('GET /api/appointments/my-appointments', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/appointments/my-appointments', false, null, error);
  }

  // Test get appointment by ID
  if (testAppointmentId) {
    try {
      const response = await apiCall('get', `/appointments/${testAppointmentId}`, null, patientToken);
      logTest('GET /api/appointments/:id', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/appointments/:id', false, null, error);
    }
  }
};

const testDoctorDashboardRoutes = async () => {
  console.log('\n=== DOCTOR DASHBOARD TESTS ==='.cyan.bold);

  if (!doctorToken) {
    console.log('⚠ Skipping doctor dashboard routes - no doctor token available'.yellow);
    return;
  }

  // Test get doctor dashboard
  try {
    const response = await apiCall('get', '/doctor/dashboard', null, doctorToken);
    logTest('GET /api/doctor/dashboard', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctor/dashboard', false, null, error);
  }

  // Test get doctor appointments
  try {
    const response = await apiCall('get', '/doctor/appointments', null, doctorToken);
    logTest('GET /api/doctor/appointments', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctor/appointments', false, null, error);
  }

  // Test get doctor profile
  try {
    const response = await apiCall('get', '/doctor/profile', null, doctorToken);
    logTest('GET /api/doctor/profile', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/doctor/profile', false, null, error);
  }

  // Test update doctor profile
  try {
    const updateData = {
      bio: 'Updated bio for testing'
    };
    const response = await apiCall('put', '/doctor/profile', updateData, doctorToken);
    logTest('PUT /api/doctor/profile', response.status === 200, response);
  } catch (error) {
    logTest('PUT /api/doctor/profile', false, null, error);
  }
};

const testPrescriptionRoutes = async () => {
  console.log('\n=== PRESCRIPTION ROUTES TESTS ==='.cyan.bold);

  if (!doctorToken) {
    console.log('⚠ Skipping prescription routes - no doctor token available'.yellow);
    return;
  }

  // Test get prescriptions (doctor)
  try {
    const response = await apiCall('get', '/prescriptions/doctor/my-prescriptions', null, doctorToken);
    logTest('GET /api/prescriptions/doctor/my-prescriptions (Doctor)', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/prescriptions/doctor/my-prescriptions (Doctor)', false, null, error);
  }
};

const testDepartmentRoutes = async () => {
  console.log('\n=== DEPARTMENT ROUTES TESTS ==='.cyan.bold);

  // Test get all departments
  try {
    const response = await apiCall('get', '/departments');
    if (response.data.departments && response.data.departments.length > 0) {
      testDepartmentId = response.data.departments[0]._id;
    }
    logTest('GET /api/departments', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/departments', false, null, error);
  }

  // Test get department by ID
  if (testDepartmentId) {
    try {
      const response = await apiCall('get', `/departments/${testDepartmentId}`);
      logTest('GET /api/departments/:id', response.status === 200, response);
    } catch (error) {
      logTest('GET /api/departments/:id', false, null, error);
    }
  }
};

const testNotificationRoutes = async () => {
  console.log('\n=== NOTIFICATION ROUTES TESTS ==='.cyan.bold);

  if (!patientToken) {
    console.log('⚠ Skipping notification routes - no patient token available'.yellow);
    return;
  }

  // Test get notifications
  try {
    const response = await apiCall('get', '/notifications', null, patientToken);
    logTest('GET /api/notifications', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/notifications', false, null, error);
  }

  // Test get unread notifications count
  try {
    const response = await apiCall('get', '/notifications/unread/count', null, patientToken);
    logTest('GET /api/notifications/unread/count', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/notifications/unread/count', false, null, error);
  }
};

const testAdminDashboardRoutes = async () => {
  console.log('\n=== ADMIN DASHBOARD TESTS ==='.cyan.bold);

  if (!adminToken) {
    console.log('⚠ Skipping admin dashboard routes - no admin token available'.yellow);
    return;
  }

  // Test get admin dashboard
  try {
    const response = await apiCall('get', '/admin/dashboard', null, adminToken);
    logTest('GET /api/admin/dashboard', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/dashboard', false, null, error);
  }

  // Test get admin stats
  try {
    const response = await apiCall('get', '/admin/stats', null, adminToken);
    logTest('GET /api/admin/stats', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/stats', false, null, error);
  }
};

const testAdminUserManagementRoutes = async () => {
  console.log('\n=== ADMIN USER MANAGEMENT TESTS ==='.cyan.bold);

  if (!adminToken) {
    console.log('⚠ Skipping admin user management routes - no admin token available'.yellow);
    return;
  }

  // Test get all doctors (admin)
  try {
    const response = await apiCall('get', '/admin/doctors', null, adminToken);
    logTest('GET /api/admin/doctors', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/doctors', false, null, error);
  }

  // Test get pending doctors
  try {
    const response = await apiCall('get', '/admin/doctors', { status: 'pending' }, adminToken);
    logTest('GET /api/admin/doctors?status=pending', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/doctors?status=pending', false, null, error);
  }

  // Test get all patients (admin)
  try {
    const response = await apiCall('get', '/admin/patients', null, adminToken);
    logTest('GET /api/admin/patients', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/patients', false, null, error);
  }

  // Test get all appointments (admin)
  try {
    const response = await apiCall('get', '/admin/appointments', null, adminToken);
    logTest('GET /api/admin/appointments', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/appointments', false, null, error);
  }
};

const testAdminDepartmentRoutes = async () => {
  console.log('\n=== ADMIN DEPARTMENT TESTS ==='.cyan.bold);

  if (!adminToken) {
    console.log('⚠ Skipping admin department routes - no admin token available'.yellow);
    return;
  }

  // Test create department
  try {
    const departmentData = {
      name: `Test Department ${Date.now()}`,
      code: 'TEST' + Math.floor(Math.random() * 100),
      description: 'Test department description for API testing',
      hasEmergencyServices: false,
      services: [
        { name: 'General Consultation', description: 'General health checkup and consultation' },
        { name: 'Diagnostics', description: 'Diagnostic testing services' }
      ]
    };
    const response = await apiCall('post', '/admin/departments', departmentData, adminToken);
    logTest('POST /api/admin/departments', response.status === 201, response);
  } catch (error) {
    logTest('POST /api/admin/departments', false, null, error);
  }
};

const testAdminLabTestRoutes = async () => {
  console.log('\n=== ADMIN LAB TEST TESTS ==='.cyan.bold);

  if (!adminToken) {
    console.log('⚠ Skipping admin lab test routes - no admin token available'.yellow);
    return;
  }

  // Test get all lab tests (admin)
  try {
    const response = await apiCall('get', '/admin/lab-tests', null, adminToken);
    logTest('GET /api/admin/lab-tests', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/admin/lab-tests', false, null, error);
  }
};

const testChatbotRoutes = async () => {
  console.log('\n=== CHATBOT ROUTES TESTS ==='.cyan.bold);

  if (!patientToken) {
    console.log('⚠ Skipping chatbot routes - no patient token available'.yellow);
    return;
  }

  // Test send message to chatbot
  try {
    const messageData = {
      message: 'I have a headache'
    };
    const response = await apiCall('post', '/chatbot/message', messageData, patientToken);
    logTest('POST /api/chatbot/message', response.status === 200, response);
  } catch (error) {
    logTest('POST /api/chatbot/message', false, null, error);
  }
};

const testLeaveRoutes = async () => {
  console.log('\n=== LEAVE ROUTES TESTS ==='.cyan.bold);

  if (!doctorToken) {
    console.log('⚠ Skipping leave routes - no doctor token available'.yellow);
    return;
  }

  // Test get my leaves
  try {
    const response = await apiCall('get', '/leaves/my-leaves', null, doctorToken);
    logTest('GET /api/leaves/my-leaves', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/leaves/my-leaves', false, null, error);
  }

  // Test get leave statistics
  try {
    const response = await apiCall('get', '/leaves/statistics', null, doctorToken);
    logTest('GET /api/leaves/statistics', response.status === 200, response);
  } catch (error) {
    logTest('GET /api/leaves/statistics', false, null, error);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('\n╔════════════════════════════════════════════════════════╗'.cyan.bold);
  console.log('║          MEDICARE PLUS - API TEST SUITE               ║'.cyan.bold);
  console.log('╚════════════════════════════════════════════════════════╝'.cyan.bold);
  console.log(`\nTesting API: ${API_URL}`.yellow);
  console.log(`Start time: ${new Date().toLocaleString()}`.yellow);

  try {
    await testHealthCheck();
    await testAuthRoutes();
    await testDoctorRoutes();
    await testPatientRoutes();
    await testAppointmentRoutes();
    await testDoctorDashboardRoutes();
    await testPrescriptionRoutes();
    await testDepartmentRoutes();
    await testNotificationRoutes();
    await testAdminDashboardRoutes();
    await testAdminUserManagementRoutes();
    await testAdminDepartmentRoutes();
    await testAdminLabTestRoutes();
    await testChatbotRoutes();
    await testLeaveRoutes();
  } catch (error) {
    console.error('\n❌ Test suite error:'.red, error.message);
  }

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗'.cyan.bold);
  console.log('║                    TEST SUMMARY                        ║'.cyan.bold);
  console.log('╚════════════════════════════════════════════════════════╝'.cyan.bold);
  console.log(`\nTotal Tests: ${totalTests}`.white);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${failedTests}`.red);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`.yellow);
  console.log(`\nEnd time: ${new Date().toLocaleString()}`.yellow);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! 🎉'.green.bold);
  } else {
    console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the errors above.`.red.bold);
  }
};

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
