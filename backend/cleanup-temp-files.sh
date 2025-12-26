#!/bin/bash
# Cleanup unnecessary test and utility files from backend folder

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Cleaning Up Backend Temporary Files                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

cd /Users/aryankansal/Desktop/Soft/my-react-app/backend

# Files to KEEP (essential)
KEEP_FILES=(
  "test-all-apis.js"                    # Main comprehensive API test suite
  "create-realistic-patients.js"         # Patient data creation
  "create-test-patient.js"               # Test patient creation
  "reset-test-patient-password.js"       # Password reset utility
  "count-api-endpoints.js"               # API endpoint counter
  "server.js"                            # Main server file
)

# Files to DELETE (temporary/obsolete)
DELETE_FILES=(
  "approve-all-doctors.js"
  "approve-pending-doctors.js"
  "check-dashboard-data.js"
  "cleanup-fake-prescriptions.js"
  "create-doctors-and-appointments.js"
  "create-doctors-appointments-week.js"
  "find-patient-password.js"
  "fix-doctor-id.js"
  "test-all-doctor-logins.js"
  "test-appointments-api.sh"
  "test-appointments-direct.js"
  "test-appointments-response.js"
  "test-appointments.js"
  "test-available-slots.sh"
  "test-complete-system.sh"
  "test-controller-output.js"
  "test-dashboard-appointments.js"
  "test-dashboard-direct.sh"
  "test-dashboard-exact.js"
  "test-delete-doctor.sh"
  "test-doctor-complete.sh"
  "test-doctor-login.js"
  "test-doctor-search.js"
  "test-manage-doctors.sh"
  "test-mongodb-connection.js"
  "test-past-date-validation.sh"
  "test-patient-data.js"
  "test-patient-data2.js"
  "test-patient-emails.js"
  "test-patient-login.js"
  "test-search-final.sh"
  "test-validation.js"
  "update-admin-pass.js"
  "update-all-doctors-password.js"
  "update-mongodb-uri.sh"
  "verify-password-hash.js"
  "verify-patient-names.sh"
  "watch-appointments-error.sh"
)

# Obsolete log files to DELETE
DELETE_LOGS=(
  "api-test-results.log"
  "api-test-results-updated.log"
  "api-test-results-final.log"
  "api-test-results-COMPLETE.log"
)

# Obsolete reports to DELETE (keep only comprehensive)
DELETE_REPORTS=(
  "API_TEST_REPORT.md"
  "API_TEST_REPORT_UPDATED.md"
  "API_TEST_REPORT_FINAL.md"
  "API_TEST_REPORT_COMPLETE.md"
)

echo "📋 Files to DELETE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

deleted_count=0
kept_count=0

# Delete test and utility files
for file in "${DELETE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  🗑️  Deleting: $file"
    rm "$file"
    ((deleted_count++))
  fi
done

# Delete obsolete log files
for file in "${DELETE_LOGS[@]}"; do
  if [ -f "$file" ]; then
    echo "  🗑️  Deleting: $file"
    rm "$file"
    ((deleted_count++))
  fi
done

# Delete obsolete reports (keep comprehensive)
for file in "${DELETE_REPORTS[@]}"; do
  if [ -f "$file" ]; then
    echo "  🗑️  Deleting: $file"
    rm "$file"
    ((deleted_count++))
  fi
done

echo ""
echo "✅ Files KEPT (Essential):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for file in "${KEEP_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
    ((kept_count++))
  fi
done

# Also keep essential documentation
KEEP_DOCS=(
  "API_TEST_REPORT_COMPREHENSIVE.md"
  "PATIENT_DATA_SUMMARY.md"
  "FILE_MANIFEST.md"
  "API_ENDPOINTS_SUMMARY.txt"
  "API_ENDPOINTS_COUNT.json"
  "TEST_RESULTS_SUMMARY.txt"
  "MONGODB_FIX_GUIDE.md"
  "api-test-results-FINAL-COMPLETE.log"
  "test-summary.txt"
)

echo ""
echo "📚 Documentation KEPT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for file in "${KEEP_DOCS[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
    ((kept_count++))
  fi
done

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                  CLEANUP SUMMARY                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "  🗑️  Files Deleted:  $deleted_count"
echo "  ✅  Files Kept:     $kept_count"
echo ""
echo "✨ Cleanup Complete!"
echo ""
