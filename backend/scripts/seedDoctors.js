// backend/scripts/seedDoctors.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');

const sampleDoctors = [
  {
    user: {
      email: 'dr.rajesh.kumar@hospital.com',
      password: 'Doctor@123',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '9876543210',
      dateOfBirth: new Date('1980-05-15'),
      gender: 'male',
      role: 'doctor',
      address: {
        street: '123 Medical Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    },
    doctor: {
      specialization: 'Cardiology',
      qualifications: [
        { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: 2005 },
        { degree: 'MD', institution: 'KEM Hospital, Mumbai', year: 2008 },
        { degree: 'DM', institution: 'AIIMS, Delhi', year: 2011 }
      ],
      medicalLicenseNumber: 'MH/MED/12345',
      medicalCouncilRegistration: 'MCI/2011/12345',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 15,
      consultationFee: 800,
      languages: ['english', 'hindi'],
      bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
      approvalStatus: 'approved',
      availability: [
        { day: 'monday', slots: [{ startTime: '09:00', endTime: '17:00' }], isAvailable: true },
        { day: 'wednesday', slots: [{ startTime: '09:00', endTime: '17:00' }], isAvailable: true },
        { day: 'friday', slots: [{ startTime: '09:00', endTime: '17:00' }], isAvailable: true }
      ],
      rating: { average: 4.8, count: 120 }
    }
  },
  {
    user: {
      email: 'dr.priya.sharma@hospital.com',
      password: 'Doctor@123',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '9876543211',
      dateOfBirth: new Date('1985-08-20'),
      gender: 'female',
      role: 'doctor',
      address: { street: '456 Health Avenue', city: 'Delhi', state: 'Delhi', pincode: '110001' }
    },
    doctor: {
      specialization: 'Dermatology',
      qualifications: [
        { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: 2008 },
        { degree: 'MD', institution: 'AIIMS, Delhi', year: 2011 }
      ],
      medicalLicenseNumber: 'DL/MED/23456',
      medicalCouncilRegistration: 'MCI/2011/23456',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 10,
      consultationFee: 600,
      languages: ['english', 'hindi'],
      bio: 'Skin care specialist with expertise in cosmetic and medical dermatology.',
      approvalStatus: 'approved',
      availability: [
        { day: 'tuesday', slots: [{ startTime: '10:00', endTime: '18:00' }], isAvailable: true },
        { day: 'thursday', slots: [{ startTime: '10:00', endTime: '18:00' }], isAvailable: true },
        { day: 'saturday', slots: [{ startTime: '10:00', endTime: '14:00' }], isAvailable: true }
      ],
      rating: { average: 4.6, count: 85 }
    }
  },
  {
    user: {
      email: 'dr.amit.patel@hospital.com',
      password: 'Doctor@123',
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '9876543212',
      dateOfBirth: new Date('1978-12-10'),
      gender: 'male',
      role: 'doctor',
      address: { street: '789 Cure Lane', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
    },
    doctor: {
      specialization: 'Orthopedics',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Ahmedabad', year: 2002 },
        { degree: 'MS', institution: 'BJ Medical College, Ahmedabad', year: 2005 }
      ],
      medicalLicenseNumber: 'GJ/MED/34567',
      medicalCouncilRegistration: 'MCI/2005/34567',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 18,
      consultationFee: 700,
      languages: ['english', 'hindi', 'gujarati'],
      bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
      approvalStatus: 'approved',
      availability: [
        { day: 'monday', slots: [{ startTime: '08:00', endTime: '16:00' }], isAvailable: true },
        { day: 'wednesday', slots: [{ startTime: '08:00', endTime: '16:00' }], isAvailable: true },
        { day: 'friday', slots: [{ startTime: '08:00', endTime: '12:00' }], isAvailable: true }
      ],
      rating: { average: 4.9, count: 156 }
    }
  },
  {
    user: {
      email: 'dr.anjali.mehta@hospital.com',
      password: 'Doctor@123',
      firstName: 'Anjali',
      lastName: 'Mehta',
      phone: '9876543213',
      dateOfBirth: new Date('1988-03-25'),
      gender: 'female',
      role: 'doctor',
      address: { street: '321 Wellness Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
    },
    doctor: {
      specialization: 'Pediatrics',
      qualifications: [
        { degree: 'MBBS', institution: 'St. Johns Medical College, Bangalore', year: 2011 },
        { degree: 'MD', institution: 'St. Johns Medical College, Bangalore', year: 2014 }
      ],
      medicalLicenseNumber: 'KA/MED/45678',
      medicalCouncilRegistration: 'MCI/2014/45678',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 8,
      consultationFee: 500,
      languages: ['english', 'hindi', 'kannada'],
      bio: 'Child health specialist with focus on preventive care and vaccinations.',
      approvalStatus: 'approved',
      availability: [
        { day: 'monday', slots: [{ startTime: '14:00', endTime: '20:00' }], isAvailable: true },
        { day: 'tuesday', slots: [{ startTime: '14:00', endTime: '20:00' }], isAvailable: true },
        { day: 'thursday', slots: [{ startTime: '14:00', endTime: '20:00' }], isAvailable: true }
      ],
      rating: { average: 4.7, count: 92 }
    }
  },
  {
    user: {
      email: 'dr.vikram.singh@hospital.com',
      password: 'Doctor@123',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '9876543214',
      dateOfBirth: new Date('1982-07-18'),
      gender: 'male',
      role: 'doctor',
      address: { street: '654 Medical Plaza', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
    },
    doctor: {
      specialization: 'General Medicine',
      qualifications: [
        { degree: 'MBBS', institution: 'Armed Forces Medical College, Pune', year: 2006 },
        { degree: 'MD', institution: 'Armed Forces Medical College, Pune', year: 2009 }
      ],
      medicalLicenseNumber: 'MH/MED/56789',
      medicalCouncilRegistration: 'MCI/2009/56789',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 12,
      consultationFee: 400,
      languages: ['english', 'hindi', 'marathi'],
      bio: 'General physician with expertise in diabetes, hypertension, and lifestyle diseases.',
      approvalStatus: 'approved',
      availability: [
        { day: 'monday', slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }], isAvailable: true },
        { day: 'wednesday', slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }], isAvailable: true },
        { day: 'friday', slots: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '15:00', endTime: '19:00' }], isAvailable: true }
      ],
      rating: { average: 4.5, count: 210 }
    }
  },
  {
    user: {
      email: 'dr.neha.gupta@hospital.com',
      password: 'Doctor@123',
      firstName: 'Neha',
      lastName: 'Gupta',
      phone: '9876543215',
      dateOfBirth: new Date('1990-11-05'),
      gender: 'female',
      role: 'doctor',
      address: { street: '987 Care Center', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' }
    },
    doctor: {
      specialization: 'Gynecology',
      qualifications: [
        { degree: 'MBBS', institution: 'Madras Medical College, Chennai', year: 2013 },
        { degree: 'MD', institution: 'Madras Medical College, Chennai', year: 2016 }
      ],
      medicalLicenseNumber: 'TN/MED/67890',
      medicalCouncilRegistration: 'MCI/2016/67890',
      licenseValidUntil: new Date('2027-12-31'),
      yearsOfExperience: 7,
      consultationFee: 550,
      languages: ['english', 'hindi', 'tamil'],
      bio: 'Women\'s health specialist providing comprehensive gynecological care.',
      approvalStatus: 'approved',
      availability: [
        { day: 'tuesday', slots: [{ startTime: '09:00', endTime: '17:00' }], isAvailable: true },
        { day: 'thursday', slots: [{ startTime: '09:00', endTime: '17:00' }], isAvailable: true },
        { day: 'saturday', slots: [{ startTime: '09:00', endTime: '13:00' }], isAvailable: true }
      ],
      rating: { average: 4.8, count: 68 }
    }
  }
];

const seedDoctors = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing doctors (optional)
    console.log('\n🗑️  Clearing existing doctors...');
    const existingDoctorUsers = await User.find({ role: 'doctor' });
    const existingDoctorIds = existingDoctorUsers.map(u => u._id);
    await Doctor.deleteMany({ user: { $in: existingDoctorIds } });
    await User.deleteMany({ role: 'doctor' });
    console.log('✅ Cleared existing doctors');

    console.log('\n👨‍⚕️ Creating doctors...');
    for (const doctorData of sampleDoctors) {
      // Create user
      const user = await User.create(doctorData.user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);

      // Create doctor profile
      const doctor = await Doctor.create({
        user: user._id,
        ...doctorData.doctor
      });
      console.log(`✅ Created doctor profile for: ${user.firstName} ${user.lastName} (${doctor.specialization})`);
    }

    console.log('\n✅ Successfully seeded', sampleDoctors.length, 'doctors!');
    console.log('\n📋 Login credentials for all doctors:');
    console.log('   Password: Doctor@123');
    console.log('\n📧 Doctor emails:');
    sampleDoctors.forEach(doc => {
      console.log(`   - ${doc.user.email} (${doc.doctor.specialization})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
