// Approve all pending doctors so patients can see them
require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor.model');

const approveAllDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get all doctors
    const allDoctors = await Doctor.find({}).populate('user', 'firstName lastName email');
    console.log(`\n📊 Total doctors in database: ${allDoctors.length}\n`);

    if (allDoctors.length === 0) {
      console.log('⚠️  No doctors found in database!');
      process.exit(0);
    }

    // Show current status
    const statusBreakdown = {
      approved: 0,
      pending: 0,
      rejected: 0,
      blocked: 0
    };

    allDoctors.forEach(doc => {
      statusBreakdown[doc.approvalStatus]++;
      if (doc.isBlocked) statusBreakdown.blocked++;
    });

    console.log('Current Status:');
    console.log('  ✅ Approved:', statusBreakdown.approved);
    console.log('  ⏳ Pending:', statusBreakdown.pending);
    console.log('  ❌ Rejected:', statusBreakdown.rejected);
    console.log('  🚫 Blocked:', statusBreakdown.blocked);
    console.log('');

    // Approve all non-approved, non-blocked doctors
    const result = await Doctor.updateMany(
      { 
        approvalStatus: { $ne: 'approved' },
        isBlocked: { $ne: true }
      },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvalDate: new Date(),
          isBlocked: false
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} doctors to "approved" status\n`);

    // Show updated status
    const updatedDoctors = await Doctor.find({}).populate('user', 'firstName lastName');
    
    console.log('Updated Doctors List:');
    console.log('================================');
    updatedDoctors.forEach((doc, i) => {
      const name = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Unknown';
      const status = doc.approvalStatus;
      const blocked = doc.isBlocked ? '🚫 BLOCKED' : '';
      console.log(`${i + 1}. ${name} - ${status.toUpperCase()} ${blocked}`);
    });
    console.log('================================\n');

    const finalApproved = await Doctor.countDocuments({ approvalStatus: 'approved', isBlocked: { $ne: true } });
    console.log(`\n🎉 Success! ${finalApproved} doctors are now visible to patients.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

approveAllDoctors();
