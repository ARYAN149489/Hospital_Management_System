// Test script to verify past date/time validation
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzJkMjhlNzljMzg3NjNjNmJjOWFhNDAiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTczMDk4NTcwNSwiZXhwIjoxNzMxNTkwNTA1fQ.UuAKFxNfcT-c_j4NWG1UgKxsUDTb1VeRQkTnr-m9_5M';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testValidation() {
  console.log('🧪 Testing Past Date/Time Validation');
  console.log('=====================================\n');

  try {
    // Get first doctor
    const doctorsRes = await api.get('/doctors');
    const doctorId = doctorsRes.data.data[0]._id;
    console.log('✅ Using Doctor ID:', doctorId, '\n');

    // Test 1: Get available slots for today
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    console.log('Test 1: Get available slots for TODAY (' + today + ')');
    console.log('Current time:', currentTime);
    console.log('Expected: Should only show slots AFTER current time');
    console.log('---------------------------------------------------');
    
    const slotsRes = await api.get(`/appointments/available-slots/${doctorId}?date=${today}`);
    const availableSlots = slotsRes.data.data.slots
      .filter(s => s.available)
      .map(s => s.time);
    
    console.log('Available slots for today:', availableSlots.length > 0 ? availableSlots.slice(0, 5).join(', ') + '...' : 'None');
    
    // Check if any slot is in the past
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const hasPastSlots = availableSlots.some(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      return hour < currentHour || (hour === currentHour && minute <= currentMinute);
    });
    
    if (hasPastSlots) {
      console.log('❌ FAILED: Found past time slots in available slots');
    } else {
      console.log('✅ PASSED: No past time slots in available slots');
    }
    console.log('');

    // Test 2: Try to book for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log('Test 2: Try to book for YESTERDAY (' + yesterdayStr + ')');
    console.log('Expected: Should be REJECTED with error message');
    console.log('--------------------------------------------------------');
    
    try {
      await api.post('/appointments', {
        doctorId: doctorId,
        date: yesterdayStr,
        time: '10:00',
        type: 'in-person',
        reason: 'Test past date'
      });
      console.log('❌ FAILED: Booking for past date was accepted');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASSED: Booking rejected with message:', error.response.data.message);
      } else {
        console.log('❌ FAILED: Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Try to book for tomorrow (should succeed)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('Test 3: Try to book for TOMORROW (' + tomorrowStr + ')');
    console.log('Expected: Should SUCCEED');
    console.log('---------------------------------------------');
    
    // Get available slots for tomorrow first
    const tomorrowSlotsRes = await api.get(`/appointments/available-slots/${doctorId}?date=${tomorrowStr}`);
    const tomorrowSlots = tomorrowSlotsRes.data.data.slots.filter(s => s.available);
    
    if (tomorrowSlots.length > 0) {
      const testTime = tomorrowSlots[0].time;
      try {
        const bookRes = await api.post('/appointments', {
          doctorId: doctorId,
          date: tomorrowStr,
          time: testTime,
          type: 'in-person',
          reason: 'Test future date'
        });
        console.log('✅ PASSED: Booking for future date succeeded');
        console.log('Appointment ID:', bookRes.data.data._id);
        
        // Clean up - cancel the test appointment
        await api.patch(`/appointments/${bookRes.data.data._id}/cancel`, {
          reason: 'Test appointment'
        });
        console.log('✅ Test appointment cancelled');
      } catch (error) {
        console.log('❌ FAILED: Booking for future date was rejected:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('⚠️  SKIPPED: No available slots for tomorrow');
    }

    console.log('\n✅ All validation tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
}

testValidation();
