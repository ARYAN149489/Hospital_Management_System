// backend/update-all-doctors-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const updateAllDoctorsPassword = async () => {
  try {
    await connectDB();

    // Import models after connection
    const User = require('./models/User.model');
    const Doctor = require('./models/Doctor.model');

    console.log('\n🔄 Starting password update for all doctors...\n');

    // Find all doctors
    const doctors = await Doctor.find().populate('user');
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found in the database');
      process.exit(0);
    }

    console.log(`📋 Found ${doctors.length} doctor(s)\n`);

    const newPassword = 'Doctor@123';
    
    // Hash the password once with bcrypt
    console.log('🔐 Hashing password with bcrypt...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed successfully\n');

    let updatedCount = 0;
    let errorCount = 0;

    // Update each doctor's password
    for (const doctor of doctors) {
      try {
        if (!doctor.user) {
          console.log(`⚠️  Doctor ${doctor._id} has no associated user - skipping`);
          errorCount++;
          continue;
        }

        const user = await User.findById(doctor.user._id);
        
        if (!user) {
          console.log(`⚠️  User not found for doctor ${doctor.name || doctor._id} - skipping`);
          errorCount++;
          continue;
        }

        // Update password directly in database to bypass pre-save hook
        // This prevents double-hashing
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`✅ Updated password for Dr. ${doctor.name || 'Unknown'} (${user.email})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating password for doctor ${doctor._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 PASSWORD UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total doctors found: ${doctors.length}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Failed/Skipped: ${errorCount}`);
    console.log('='.repeat(60));
    console.log(`\n🔑 New password for all doctors: ${newPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
};

// Run the update
updateAllDoctorsPassword();
