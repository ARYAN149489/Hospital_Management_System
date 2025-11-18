// Script to update admin password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User.model');
const Admin = require('./models/Admin.model');

const updateAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management');
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@medicareplus.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found with email: admin@medicareplus.com');
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({});
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
      process.exit(1);
    }

    console.log('✅ Found admin user:', adminUser.email);
    console.log('   User ID:', adminUser._id);
    console.log('   Role:', adminUser.role);

    // Set new password (pre-save hook will hash it automatically)
    const newPassword = 'Admin@123';
    console.log('\n🔐 Updating password...');
    
    // Set the password directly - the pre-save hook will hash it
    adminUser.password = newPassword;
    await adminUser.save();

    console.log('✅ Password updated successfully!');
    
    // Verify the password - need to fetch user with password field
    console.log('\n🔍 Verifying new password...');
    const userWithPassword = await User.findById(adminUser._id).select('+password');
    const isMatch = await bcrypt.compare(newPassword, userWithPassword.password);
    console.log(isMatch ? '✅ Password verification successful!' : '❌ Password verification failed!');

    console.log('\n✅ ADMIN CREDENTIALS:');
    console.log('   Email: admin@medicareplus.com');
    console.log('   Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateAdminPassword();
