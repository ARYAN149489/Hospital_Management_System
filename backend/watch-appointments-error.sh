#!/bin/bash

echo "🔍 Waiting for appointment request..."
echo "Please open your browser and:"
echo "  1. Go to My Appointments page"
echo "  2. Change the date to any day (Nov 10, 11, 12, etc.)"
echo ""
echo "Watching logs for the next 30 seconds..."
echo "=========================================="
echo ""

cd /Users/aryankansal/Desktop/Soft/my-react-app/backend
timeout 30 tail -f backend_debug.log | grep --line-buffered -A 20 -B 5 "appointments\|Error\|error" || echo "Timeout reached"

echo ""
echo "=========================================="
echo "Log capture complete!"
