#!/bin/bash

# Test script for past date/time validation
# This tests that the system properly validates appointments for past dates/times

BASE_URL="http://localhost:5000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzJkMjhlNzljMzg3NjNjNmJjOWFhNDAiLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTczMDk4NTcwNSwiZXhwIjoxNzMxNTkwNTA1fQ.UuAKFxNfcT-c_j4NWG1UgKxsUDTb1VeRQkTnr-m9_5M"

echo "🧪 Testing Past Date/Time Validation"
echo "====================================="
echo ""

# Get a doctor ID first
echo "📋 Getting doctor list..."
DOCTOR_ID=$(curl -s -X GET \
  "${BASE_URL}/doctors" \
  -H "Authorization: Bearer ${TOKEN}" | jq -r '.data[0]._id')

echo "✅ Using Doctor ID: ${DOCTOR_ID}"
echo ""

# Test 1: Try to book for yesterday
YESTERDAY=$(date -v-1d +%Y-%m-%d)
echo "Test 1: Booking for yesterday (${YESTERDAY}) at 10:00 - Should FAIL"
echo "--------------------------------------------------------------------"
curl -s -X POST \
  "${BASE_URL}/appointments" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctorId\": \"${DOCTOR_ID}\",
    \"date\": \"${YESTERDAY}\",
    \"time\": \"10:00\",
    \"type\": \"in-person\",
    \"reason\": \"Test past date\"
  }" | jq '.'
echo ""

# Test 2: Get available slots for today (should exclude past times)
TODAY=$(date +%Y-%m-%d)
echo "Test 2: Getting available slots for today (${TODAY}) - Should exclude past times"
echo "--------------------------------------------------------------------------------"
curl -s -X GET \
  "${BASE_URL}/appointments/available-slots/${DOCTOR_ID}?date=${TODAY}" \
  -H "Authorization: Bearer ${TOKEN}" | jq '.data.slots[] | select(.available == true) | .time' | head -10
echo ""

# Test 3: Try to book for today at a past time (e.g., 09:00)
echo "Test 3: Booking for today at 09:00 - Should FAIL if current time is past 09:00"
echo "------------------------------------------------------------------------------"
curl -s -X POST \
  "${BASE_URL}/appointments" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctorId\": \"${DOCTOR_ID}\",
    \"date\": \"${TODAY}\",
    \"time\": \"09:00\",
    \"type\": \"in-person\",
    \"reason\": \"Test past time\"
  }" | jq '.'
echo ""

# Test 4: Book for tomorrow (should succeed)
TOMORROW=$(date -v+1d +%Y-%m-%d)
echo "Test 4: Booking for tomorrow (${TOMORROW}) at 10:00 - Should SUCCEED"
echo "--------------------------------------------------------------------"
curl -s -X POST \
  "${BASE_URL}/appointments" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctorId\": \"${DOCTOR_ID}\",
    \"date\": \"${TOMORROW}\",
    \"time\": \"10:00\",
    \"type\": \"in-person\",
    \"reason\": \"Test future date\"
  }" | jq '.'
echo ""

echo "✅ Test completed!"
