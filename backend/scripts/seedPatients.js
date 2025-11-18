// backend/scripts/seedPatients.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedPatients = async () => {
  try {
    console.log('🌱 Starting to seed sample patients...\n');

    const samplePatients = [
      {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        password: 'Patient@123',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        bloodGroup: 'O+',
        address: {
          street: '123 MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      },
      {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.patel@example.com',
        phone: '9876543211',
        password: 'Patient@123',
        dateOfBirth: '1985-08-22',
        gender: 'female',
        bloodGroup: 'A+',
        address: {
          street: '456 Brigade Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        }
      },
      {
        firstName: 'Amit',
        lastName: 'Kumar',
        email: 'amit.kumar@example.com',
        phone: '9876543212',
        password: 'Patient@123',
        dateOfBirth: '1995-03-10',
        gender: 'male',
        bloodGroup: 'B+',
        address: {
          street: '789 Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        }
      },
      {
        firstName: 'Sneha',
        lastName: 'Reddy',
        email: 'sneha.reddy@example.com',
        phone: '9876543213',
        password: 'Patient@123',
        dateOfBirth: '1988-12-05',
        gender: 'female',
        bloodGroup: 'AB+',
        address: {
          street: '321 Park Street',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700001',
          country: 'India'
        }
      },
      {
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.singh@example.com',
        phone: '9876543214',
        password: 'Patient@123',
        dateOfBirth: '1992-07-18',
        gender: 'male',
        bloodGroup: 'O-',
        address: {
          street: '654 Marine Drive',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          country: 'India'
        }
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const patientData of samplePatients) {
      // Check if patient already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: patientData.email },
          { phone: patientData.phone }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  Patient ${patientData.firstName} ${patientData.lastName} already exists (skipped)`);
        skippedCount++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(patientData.password, 10);

      // Create User
      const user = await User.create({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        password: hashedPassword,
        role: 'patient',
        dateOfBirth: new Date(patientData.dateOfBirth),
        gender: patientData.gender,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      });

      // Create Patient Profile
      await Patient.create({
        user: user._id,
        bloodGroup: patientData.bloodGroup,
        address: patientData.address,
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '9999999999'
        }
      });

      console.log(`✅ Created patient: ${patientData.firstName} ${patientData.lastName}`);
      createdCount++;
    }

    console.log('\n✨ Patient seeding completed!');
    console.log(`   - Created: ${createdCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    console.log('\n🔑 Login credentials for all patients:');
    console.log('   Password: Patient@123');
    console.log('\n📧 Patient emails:');
    samplePatients.forEach(p => console.log(`   - ${p.email}`));

  } catch (error) {
    console.error('❌ Error seeding patients:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the seed function
connectDB().then(() => {
  seedPatients();
});
