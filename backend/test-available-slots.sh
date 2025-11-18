#!/bin/bash
# Test available slots endpoint

echo "🧪 Testing Available Slots Endpoint"
echo "===================================="
echo ""

# Get a doctor ID first
DOCTOR_ID=$(curl -s "http://localhost:5002/api/doctors?limit=1" | jq -r '.data[0]._id')

if [ -z "$DOCTOR_ID" ] || [ "$DOCTOR_ID" = "null" ]; then
  echo "❌ Failed to get doctor ID"
  exit 1
fi

echo "✅ Using Doctor ID: $DOCTOR_ID"
echo ""

# Test with today's date
TODAY=$(date +%Y-%m-%d)
echo "Test 1: Get available slots for today ($TODAY)"
curl -s "http://localhost:5002/api/appointments/available-slots/$DOCTOR_ID?date=$TODAY" | jq '{success, date, slots: [.data.slots[]? | {time, available}] | .[0:3]}'
echo ""

# Test with future date
FUTURE_DATE=$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "+7 days" +%Y-%m-%d)
echo "Test 2: Get available slots for future date ($FUTURE_DATE)"
curl -s "http://localhost:5002/api/appointments/available-slots/$DOCTOR_ID?date=$FUTURE_DATE" | jq '{success, date, availableCount: (.data.slots | length)}'
echo ""

# Test with invalid doctor ID (should return 404)
echo "Test 3: Invalid doctor ID (should fail)"
curl -s "http://localhost:5002/api/appointments/available-slots/invalid123?date=$TODAY" | jq '{success, message}'
echo ""

# Test without date parameter (should return 400)
echo "Test 4: Missing date parameter (should fail)"
curl -s "http://localhost:5002/api/appointments/available-slots/$DOCTOR_ID" | jq '{success, message}'
echo ""

echo "🎉 Tests completed!"
