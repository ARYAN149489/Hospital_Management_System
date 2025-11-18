// Verify password is properly bcrypted in database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const verifyPasswordHash = async () => {
  try {
    await connectDB();

    const User = require('./models/User.model');
    
    // Get a sample doctor user with password
    const user = await User.findOne({ email: 'dr.rajesh.kumar@hospital.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('👤 User:', user.email);
    console.log('🔐 Password Hash:', user.password);
    console.log('\n📊 Hash Analysis:');
    console.log('   Length:', user.password.length, 'characters');
    console.log('   Format:', user.password.substring(0, 7), '... (bcrypt format)');
    console.log('   Valid bcrypt hash:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$') ? '✅ Yes' : '❌ No');
    
    // Test password verification
    console.log('\n🧪 Testing password verification:');
    const isValid = await bcrypt.compare('Doctor@123', user.password);
    console.log('   Password "Doctor@123" matches:', isValid ? '✅ Yes' : '❌ No');
    
    if (isValid) {
      console.log('\n✅ SUCCESS! Password is properly bcrypted and can be verified!');
    } else {
      console.log('\n❌ ERROR! Password verification failed!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyPasswordHash();
