#!/bin/bash
# Complete test suite for doctor functionality

echo "🧪 Complete Doctor Functionality Test Suite"
echo "=============================================="
echo ""

# Test 1: Search by name
echo "Test 1: Search by Doctor Name"
curl -s "http://localhost:5002/api/doctors/search?query=Priya" | jq -r '.count, .data[0].name, .data[0].specialization'
echo ""

# Test 2: Search by specialization
echo "Test 2: Search by Specialization"
curl -s "http://localhost:5002/api/doctors/search?query=Cardiology" | jq -r '.count, .data[0].name, .data[0].specialization'
echo ""

# Test 3: Get all doctors
echo "Test 3: Get All Doctors"
curl -s "http://localhost:5002/api/doctors" | jq -r '.count, .total'
echo ""

# Test 4: Search partial name
echo "Test 4: Partial Name Search (Anj)"
curl -s "http://localhost:5002/api/doctors/search?query=Anj" | jq -r '.count, .data[0].name'
echo ""

# Test 5: Search partial specialization
echo "Test 5: Partial Specialization Search (Derma)"
curl -s "http://localhost:5002/api/doctors/search?query=Derma" | jq -r '.count, .data[0].specialization'
echo ""

echo "✅ All tests completed!"
