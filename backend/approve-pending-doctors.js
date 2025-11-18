// Script to approve all pending doctors
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Doctor = require('./models/Doctor.model');
require('dotenv').config();

const approvePendingDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');

    // Find all pending doctors
    const pendingDoctors = await Doctor.find({ approvalStatus: 'pending' })
      .populate('user', 'firstName lastName email');

    console.log(`\n📋 Found ${pendingDoctors.length} pending doctors:\n`);

    if (pendingDoctors.length === 0) {
      console.log('✅ No pending doctors found. All doctors are already approved!');
      process.exit(0);
    }

    // Display pending doctors
    pendingDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`);
      console.log(`   Email: ${doctor.user?.email}`);
      console.log(`   Specialization: ${doctor.specialization}`);
      console.log(`   Status: ${doctor.approvalStatus}`);
      console.log('');
    });

    // Approve all pending doctors
    const result = await Doctor.updateMany(
      { approvalStatus: 'pending' },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvedAt: new Date(),
          isBlocked: false
        }
      }
    );

    console.log(`✅ Successfully approved ${result.modifiedCount} doctors!`);
    console.log('\n📝 All doctors are now visible to patients.\n');

    // Verify the update
    const approvedCount = await Doctor.countDocuments({ approvalStatus: 'approved' });
    const totalCount = await Doctor.countDocuments();
    
    console.log(`📊 Statistics:`);
    console.log(`   Total Doctors: ${totalCount}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   Pending: ${totalCount - approvedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error approving doctors:', error);
    process.exit(1);
  }
};

approvePendingDoctors();
