// Script to create 2 new doctors and add appointments for patients
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User.model');
const Doctor = require('./models/Doctor.model');
const Patient = require('./models/Patient.model');
const Appointment = require('./models/Appointment.model');
const Department = require('./models/Department.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Helper function to generate future dates
const getFutureDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// New doctors data
const newDoctorsData = [
  {
    user: {
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul.verma@medicareplus.com',
      password: 'Doctor@123',
      phone: '9876543210',
      role: 'doctor',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      address: {
        street: '45 Medical Plaza',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    },
    doctor: {
      specialization: 'Cardiology',
      qualifications: [
        {
          degree: 'MBBS',
          institution: 'All India Institute of Medical Sciences',
          year: 2008
        },
        {
          degree: 'MD (Cardiology)',
          institution: 'PGI Chandigarh',
          year: 2012
        },
        {
          degree: 'Fellowship in Interventional Cardiology',
          institution: 'Cleveland Clinic, USA',
          year: 2014
        }
      ],
      medicalLicenseNumber: 'MH-CARD-2024-1234',
      yearsOfExperience: 12,
      consultationFee: 1500,
      bio: 'Dr. Rahul Verma is a highly experienced cardiologist with expertise in interventional cardiology. He has performed over 2000 successful cardiac procedures and specializes in angioplasty, pacemaker implantation, and heart failure management.',
      languages: ['english', 'hindi', 'marathi'],
      availableSlots: {
        Monday: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '15:00', endTime: '18:00' }
        ],
        Tuesday: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '15:00', endTime: '18:00' }
        ],
        Wednesday: [
          { startTime: '09:00', endTime: '13:00' }
        ],
        Thursday: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '15:00', endTime: '18:00' }
        ],
        Friday: [
          { startTime: '09:00', endTime: '13:00' },
          { startTime: '15:00', endTime: '18:00' }
        ]
      },
      approvalStatus: 'approved'
    }
  },
  {
    user: {
      firstName: 'Meera',
      lastName: 'Kapoor',
      email: 'meera.kapoor@medicareplus.com',
      password: 'Doctor@123',
      phone: '9876543211',
      role: 'doctor',
      dateOfBirth: new Date('1988-07-22'),
      gender: 'female',
      address: {
        street: '78 Health Center Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    },
    doctor: {
      specialization: 'Dermatology',
      qualifications: [
        {
          degree: 'MBBS',
          institution: 'Maulana Azad Medical College',
          year: 2010
        },
        {
          degree: 'MD (Dermatology)',
          institution: 'AIIMS Delhi',
          year: 2014
        },
        {
          degree: 'Fellowship in Cosmetic Dermatology',
          institution: 'Harvard Medical School',
          year: 2016
        }
      ],
      medicalLicenseNumber: 'DL-DERM-2024-5678',
      yearsOfExperience: 9,
      consultationFee: 1200,
      bio: 'Dr. Meera Kapoor is a renowned dermatologist specializing in medical and cosmetic dermatology. She has extensive experience in treating skin disorders, acne, psoriasis, and performing advanced cosmetic procedures like laser treatments and chemical peels.',
      languages: ['english', 'hindi', 'punjabi'],
      availableSlots: {
        Monday: [
          { startTime: '10:00', endTime: '14:00' },
          { startTime: '16:00', endTime: '19:00' }
        ],
        Tuesday: [
          { startTime: '10:00', endTime: '14:00' },
          { startTime: '16:00', endTime: '19:00' }
        ],
        Wednesday: [
          { startTime: '10:00', endTime: '14:00' },
          { startTime: '16:00', endTime: '19:00' }
        ],
        Thursday: [
          { startTime: '10:00', endTime: '14:00' }
        ],
        Friday: [
          { startTime: '10:00', endTime: '14:00' },
          { startTime: '16:00', endTime: '19:00' }
        ],
        Saturday: [
          { startTime: '10:00', endTime: '13:00' }
        ]
      },
      approvalStatus: 'approved'
    }
  }
];

// Appointment data template
const appointmentSlots = [
  { daysFromNow: 2, time: '10:00 AM', duration: 30, reason: 'Regular checkup' },
  { daysFromNow: 5, time: '11:00 AM', duration: 30, reason: 'Follow-up consultation' },
  { daysFromNow: 7, time: '02:00 PM', duration: 30, reason: 'Health screening' },
  { daysFromNow: 10, time: '03:00 PM', duration: 30, reason: 'Preventive care visit' },
  { daysFromNow: 14, time: '10:30 AM', duration: 30, reason: 'Medical consultation' }
];

async function createDoctorsAndAppointments() {
  try {
    console.log('\n🚀 Starting doctor and appointment creation process...\n');

    // Get all departments
    const departments = await Department.find();
    if (departments.length === 0) {
      console.log('❌ No departments found. Please create departments first.');
      process.exit(1);
    }

    // Get all patients
    const patients = await Patient.find().populate('user').limit(10);
    if (patients.length === 0) {
      console.log('❌ No patients found. Please create patients first.');
      process.exit(1);
    }

    console.log(`✅ Found ${patients.length} patients`);
    console.log(`✅ Found ${departments.length} departments\n`);

    const createdDoctors = [];

    // Create each doctor
    for (let i = 0; i < newDoctorsData.length; i++) {
      const docData = newDoctorsData[i];
      
      console.log(`\n📋 Creating Doctor ${i + 1}: Dr. ${docData.user.firstName} ${docData.user.lastName}`);
      console.log(`   Specialization: ${docData.doctor.specialization}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email: docData.user.email });
      let user;
      
      if (existingUser) {
        console.log(`   ⚠️  User already exists with email: ${docData.user.email}`);
        const existingDoctor = await Doctor.findOne({ user: existingUser._id });
        if (existingDoctor) {
          console.log(`   ℹ️  Using existing doctor`);
          createdDoctors.push(existingDoctor);
          continue;
        }
        user = existingUser;
        console.log(`   ℹ️  Creating doctor profile for existing user`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(docData.user.password, 10);

        // Create user
        user = await User.create({
          ...docData.user,
          password: hashedPassword,
          isActive: true,
          isEmailVerified: true
        });

        console.log(`   ✅ User created: ${user.email}`);
      }

      // Find matching department
      const department = departments.find(d => 
        d.name.toLowerCase().includes(docData.doctor.specialization.toLowerCase())
      ) || departments[0];

      console.log(`   Department: ${department.name}`);

      // Create doctor
      const doctor = await Doctor.create({
        user: user._id,
        department: department._id,
        doctorId: `DOC${String(Date.now()).slice(-6)}`, // Use timestamp-based unique ID
        ...docData.doctor
      });

      console.log(`   ✅ Doctor profile created with ID: ${doctor._id}`);
      createdDoctors.push(doctor);
    }

    console.log(`\n✅ Successfully created ${createdDoctors.length} doctors\n`);

    // Create appointments for each doctor
    let totalAppointments = 0;

    // Re-fetch doctors with populated user data
    const doctorsWithUsers = await Doctor.find({
      _id: { $in: createdDoctors.map(d => d._id) }
    }).populate('user');

    for (let i = 0; i < doctorsWithUsers.length; i++) {
      const doctor = doctorsWithUsers[i];
      const doctorUser = doctor.user;
      
      if (!doctorUser) {
        console.log(`⚠️  Skipping doctor without user`);
        continue;
      }
      
      console.log(`\n📅 Creating appointments for Dr. ${doctorUser.firstName} ${doctorUser.lastName}`);

      // Create 2-3 appointments per patient (up to 5 patients per doctor)
      const patientsForDoctor = patients.slice(i * 2, (i * 2) + 5);
      
      for (let j = 0; j < patientsForDoctor.length; j++) {
        const patient = patientsForDoctor[j];
        const patientUser = patient.user; // Already populated from initial query

        if (!patientUser) {
          console.log(`   ⚠️  Skipping patient without user`);
          continue;
        }

        // Create 1-2 appointments per patient
        const numAppointments = Math.min(2, appointmentSlots.length);
        
        for (let k = 0; k < numAppointments; k++) {
          const slot = appointmentSlots[(j * 2 + k) % appointmentSlots.length];
          
          const appointmentDate = getFutureDate(slot.daysFromNow);
          
          // Check if appointment already exists
          const existingAppointment = await Appointment.findOne({
            doctor: doctor._id,
            patient: patient._id,
            appointmentDate: appointmentDate,
            appointmentTime: slot.time
          });

          if (existingAppointment) {
            console.log(`   ⚠️  Appointment already exists for ${patientUser.firstName} on ${appointmentDate.toDateString()}`);
            continue;
          }

          const appointment = await Appointment.create({
            appointmentId: `APT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            patient: patient._id,
            doctor: doctor._id,
            department: doctor.department,
            appointmentDate: appointmentDate,
            appointmentTime: slot.time,
            duration: slot.duration,
            reasonForVisit: slot.reason,
            status: 'scheduled',
            appointmentType: 'in-person',
            symptoms: ['General checkup', 'Health assessment'],
            notes: `Scheduled appointment with Dr. ${doctorUser.firstName} ${doctorUser.lastName}`
          });

          console.log(`   ✅ Created appointment for ${patientUser.firstName} ${patientUser.lastName} on ${appointmentDate.toLocaleDateString()} at ${slot.time}`);
          totalAppointments++;
        }
      }
    }

    console.log(`\n🎉 Success! Created ${totalAppointments} appointments`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Doctors Created: ${createdDoctors.length}`);
    console.log(`Appointments Created: ${totalAppointments}`);
    console.log('\n📝 Doctor Details:');
    
    for (const doctor of doctorsWithUsers) {
      const user = doctor.user;
      const appointmentCount = await Appointment.countDocuments({ doctor: doctor._id });
      console.log(`\n   👨‍⚕️ Dr. ${user.firstName} ${user.lastName}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Password: Doctor@123`);
      console.log(`      Specialization: ${doctor.specialization}`);
      console.log(`      Fee: ₹${doctor.consultationFee}`);
      console.log(`      Appointments: ${appointmentCount}`);
    }

    console.log('\n✅ All done! You can now login with the doctor credentials.');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
createDoctorsAndAppointments();
