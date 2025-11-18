const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');
const Doctor = require('./models/Doctor.model');
const Patient = require('./models/Patient.model');
const Appointment = require('./models/Appointment.model');

const doctorsData = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'dr.rajesh.kumar@medicareplus.com',
    phone: '9876543210',
    specialization: 'Cardiology',
    consultationFee: 1500,
    experience: 15,
    qualification: 'MBBS, MD (Cardiology), DM',
    bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.'
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'dr.priya.sharma@medicareplus.com',
    phone: '9876543211',
    specialization: 'Pediatrics',
    consultationFee: 1200,
    experience: 12,
    qualification: 'MBBS, MD (Pediatrics)',
    bio: 'Pediatrician with expertise in child healthcare and immunization.'
  },
  {
    firstName: 'Amit',
    lastName: 'Verma',
    email: 'dr.amit.verma@medicareplus.com',
    phone: '9876543212',
    specialization: 'Orthopedics',
    consultationFee: 1800,
    experience: 18,
    qualification: 'MBBS, MS (Orthopedics)',
    bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.'
  },
  {
    firstName: 'Sunita',
    lastName: 'Patel',
    email: 'dr.sunita.patel@medicareplus.com',
    phone: '9876543213',
    specialization: 'Gynecology',
    consultationFee: 1400,
    experience: 14,
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    bio: 'Gynecologist with expertise in womens health and prenatal care.'
  },
  {
    firstName: 'Vikas',
    lastName: 'Singh',
    email: 'dr.vikas.singh@medicareplus.com',
    phone: '9876543214',
    specialization: 'Neurology',
    consultationFee: 2000,
    experience: 20,
    qualification: 'MBBS, MD (Medicine), DM (Neurology)',
    bio: 'Neurologist specializing in brain and nervous system disorders.'
  }
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const symptoms = [
  'Chest pain and discomfort',
  'Fever and cold',
  'Back pain and stiffness',
  'Headache and dizziness',
  'Stomach pain',
  'Joint pain',
  'Breathing difficulty',
  'Skin rash',
  'Regular checkup',
  'Follow-up consultation'
];

const appointmentTypes = ['in-person', 'emergency'];

async function createDoctorsAndAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all patients
    const patients = await Patient.find().populate('user');
    console.log(`📋 Found ${patients.length} patients`);

    if (patients.length === 0) {
      console.log('❌ No patients found. Please create patients first.');
      process.exit(1);
    }

    const createdDoctors = [];

    // Create doctors
    for (const doctorData of doctorsData) {
      // Check if doctor already exists
      const existingUser = await User.findOne({ email: doctorData.email });
      if (existingUser) {
        console.log(`⏭️  Doctor ${doctorData.email} already exists, skipping...`);
        const doctor = await Doctor.findOne({ user: existingUser._id });
        if (doctor) createdDoctors.push(doctor);
        continue;
      }

      // Create user account
      const hashedPassword = await bcrypt.hash('Doctor@123', 10);
      const user = await User.create({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: hashedPassword,
        phone: doctorData.phone,
        role: 'doctor',
        gender: 'male', // Default gender
        dateOfBirth: new Date('1980-01-01'), // Default DOB
        isEmailVerified: true,
        isActive: true
      });

      // Create doctor profile
      const doctor = await Doctor.create({
        user: user._id,
        specialization: doctorData.specialization,
        qualifications: [{
          degree: doctorData.qualification.split(',')[0].trim(),
          institution: 'All India Institute of Medical Sciences',
          year: 2005
        }],
        medicalLicenseNumber: `MED${Date.now()}${Math.floor(Math.random() * 1000)}`,
        yearsOfExperience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        consultationDuration: 30,
        bio: doctorData.bio,
        availability: [
          { day: 'monday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
          { day: 'tuesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
          { day: 'wednesday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
          { day: 'thursday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
          { day: 'friday', slots: [{ startTime: '09:00', endTime: '17:00' }] },
          { day: 'saturday', slots: [{ startTime: '09:00', endTime: '13:00' }] }
        ],
        isAvailable: true,
        isVerified: true,
        rating: 4.5 + Math.random() * 0.5,
        totalRatings: Math.floor(Math.random() * 100) + 50
      });

      createdDoctors.push(doctor);
      console.log(`✅ Created doctor: Dr. ${doctorData.firstName} ${doctorData.lastName}`);
    }

    console.log(`\n📅 Creating appointments for the next 7 days (excluding Sunday)...\n`);

    // Get current date (Nov 13, 2025)
    const startDate = new Date('2025-11-13');
    let appointmentsCreated = 0;

    // Create appointments for next 7 days
    for (let day = 0; day < 7; day++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(startDate.getDate() + day);
      
      // Skip Sunday (day 0)
      if (appointmentDate.getDay() === 0) {
        console.log(`⏭️  Skipping Sunday (${appointmentDate.toDateString()})`);
        continue;
      }

      console.log(`\n📆 Creating appointments for ${appointmentDate.toDateString()}`);

      // Create 3-4 appointments for each doctor
      for (const doctor of createdDoctors) {
        const numAppointments = Math.floor(Math.random() * 2) + 3; // 3 or 4 appointments
        
        for (let i = 0; i < numAppointments; i++) {
          const randomPatient = patients[Math.floor(Math.random() * patients.length)];
          const randomTimeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
          const randomSymptom = symptoms[Math.floor(Math.random() * symptoms.length)];
          const randomType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];

          // Check if appointment already exists
          const existingAppointment = await Appointment.findOne({
            doctor: doctor._id,
            appointmentDate: appointmentDate,
            appointmentTime: randomTimeSlot
          });

          if (existingAppointment) {
            continue; // Skip if slot already booked
          }

          await Appointment.create({
            appointmentId: `APT${Date.now()}${Math.floor(Math.random() * 10000)}`,
            patient: randomPatient._id,
            doctor: doctor._id,
            appointmentDate: appointmentDate,
            appointmentTime: randomTimeSlot,
            appointmentType: randomType,
            status: 'scheduled',
            symptoms: randomSymptom,
            reasonForVisit: randomSymptom,
            duration: 30,
            priority: 'normal'
          });

          appointmentsCreated++;
        }
      }
    }

    console.log(`\n✅ Successfully created ${createdDoctors.length} doctors`);
    console.log(`✅ Successfully created ${appointmentsCreated} appointments`);
    
    // Populate doctor user data for display
    const populatedDoctors = await Doctor.find({ _id: { $in: createdDoctors.map(d => d._id) } }).populate('user', 'firstName lastName');
    
    console.log('\n📋 Doctors created:');
    populatedDoctors.forEach(doc => {
      console.log(`   - Dr. ${doc.user.firstName} ${doc.user.lastName} (${doc.specialization})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createDoctorsAndAppointments();
