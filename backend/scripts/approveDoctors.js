// Script to approve all existing doctors
const mongoose = require('mongoose');
require('dotenv').config();

async function approveDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User.model.js');
    const Doctor = require('../models/Doctor.model.js');
    
    // Update all doctors without approvalStatus to 'approved'
    const result = await Doctor.updateMany(
      { $or: [{ approvalStatus: { $exists: false } }, { approvalStatus: 'pending' }] },
      { $set: { approvalStatus: 'approved', approvalDate: new Date() } }
    );

    console.log('✅ Updated', result.modifiedCount, 'doctors to approved status');

    // Verify the update
    const approvedDoctors = await Doctor.find({ approvalStatus: 'approved' })
      .populate('user', 'firstName lastName')
      .select('specialization approvalStatus');

    console.log('\n📊 Approved doctors:');
    approvedDoctors.forEach(doc => {
      console.log('-', doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'Unknown', '-', doc.specialization);
    });

    console.log('\n🎉 All doctors approved successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

approveDoctors();
