#!/bin/bash

echo "🔧 MongoDB URI Update Script"
echo "=============================="
echo ""
echo "Current MongoDB URI issue: DNS resolution failed"
echo "The MongoDB Atlas cluster doesn't exist or was deleted."
echo ""
echo "To fix this, you need to:"
echo "1. Go to https://cloud.mongodb.com/"
echo "2. Create a new FREE cluster (M0)"
echo "3. Click 'Connect' -> 'Connect your application'"
echo "4. Copy the connection string"
echo "5. Run this script with your new URI"
echo ""
read -p "Enter your new MongoDB connection string (or press Enter to skip): " NEW_URI

if [ -z "$NEW_URI" ]; then
    echo "❌ No URI provided. Exiting..."
    exit 1
fi

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backed up current .env file"

# Update the MongoDB URI
sed -i.tmp "s|^MONGODB_URI=.*|MONGODB_URI=$NEW_URI|" .env
rm -f .env.tmp

echo "✅ Updated MongoDB URI in .env"
echo ""
echo "Testing connection..."
node -e "
const mongoose = require('mongoose');
mongoose.connect('$NEW_URI', { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
