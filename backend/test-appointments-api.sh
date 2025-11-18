#!/bin/bash

# Test Doctor Appointments API
# This script tests the fixed appointments endpoint with different dates

echo "🧪 Testing Doctor Appointments API"
echo "=================================="
echo ""

# Get auth token (you'll need to update with actual credentials)
echo "ℹ️  Note: Make sure you're logged in as a doctor in the browser"
echo ""

# Test 1: Monday (Nov 10, 2025)
echo "📅 Test 1: Appointments for Monday, Nov 10, 2025"
echo "Expected: Should return appointments without 500 error"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "http://localhost:5002/api/doctor/appointments?date=2025-11-10" \
  -H "Content-Type: application/json" | head -20
echo ""
echo "---"
echo ""

# Test 2: Tuesday (Nov 11, 2025)
echo "📅 Test 2: Appointments for Tuesday, Nov 11, 2025"
echo "Expected: Should return appointments without 500 error"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "http://localhost:5002/api/doctor/appointments?date=2025-11-11" \
  -H "Content-Type: application/json" | head -20
echo ""
echo "---"
echo ""

# Test 3: Invalid date format
echo "📅 Test 3: Invalid date format"
echo "Expected: Should return 400 error with proper message"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "http://localhost:5002/api/doctor/appointments?date=invalid-date" \
  -H "Content-Type: application/json"
echo ""
echo "---"
echo ""

# Test 4: Wednesday (Nov 12, 2025)
echo "📅 Test 4: Appointments for Wednesday, Nov 12, 2025"
echo "Expected: Should return appointments without 500 error"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "http://localhost:5002/api/doctor/appointments?date=2025-11-12" \
  -H "Content-Type: application/json" | head -20
echo ""
echo "---"
echo ""

# Test 5: Thursday (Nov 13, 2025)
echo "📅 Test 5: Appointments for Thursday, Nov 13, 2025"
echo "Expected: Should return appointments without 500 error"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "http://localhost:5002/api/doctor/appointments?date=2025-11-13" \
  -H "Content-Type: application/json" | head -20
echo ""
echo "---"
echo ""

echo "✅ Tests completed!"
echo ""
echo "ℹ️  Note: 401 errors are expected if you're not authenticated"
echo "ℹ️  200 status codes indicate the endpoint is working correctly"
echo "ℹ️  400 status codes for invalid dates indicate proper validation"
