require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const cleanup = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    // Users to delete
    const emailsToDelete = [
      'test.doctor.1763028122@medicareplus.com',
      'patient_1764341521216@test.com',
      'test.patient@example.com',
      'selenium.patient113927@example.com',
      'diagnostic.patient224887@example.com',
      'diagnostic.patient921834@example.com',
      'diagnostic.patient417087@example.com'
    ];

    console.log(`\n🗑️  Deleting ${emailsToDelete.length} test users...`);

    for (const email of emailsToDelete) {
      const user = await db.collection('users').findOne({ email });
      if (user) {
        await db.collection('users').deleteOne({ _id: user._id });
        if (user.role === 'patient') {
          await db.collection('patients').deleteOne({ user: user._id });
        } else if (user.role === 'doctor') {
          await db.collection('doctors').deleteOne({ user: user._id });
        }
        await db.collection('appointments').deleteMany({ $or: [{ patient: user._id }, { doctor: user._id }] });
        await db.collection('prescriptions').deleteMany({ $or: [{ patient: user._id }, { doctor: user._id }] });
        console.log(`Deleted: ${email}`);
      }
    }

    console.log(`\n🔑 Resetting passwords for remaining actual users...`);
    
    const remainingUsers = await db.collection('users').find({}).toArray();
    
    const hashedPatientPw = await bcrypt.hash('Patient@123', 10);
    const hashedDoctorPw = await bcrypt.hash('Doctor@123', 10);

    for (const user of remainingUsers) {
      if (user.role === 'patient') {
        await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashedPatientPw } });
        console.log(`Reset Patient: ${user.email} -> Patient@123`);
      } else if (user.role === 'doctor') {
        await db.collection('users').updateOne({ _id: user._id }, { $set: { password: hashedDoctorPw } });
        console.log(`Reset Doctor: ${user.email} -> Doctor@123`);
      }
    }

    console.log('\n✅ Database cleanup and password reset complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanup();
