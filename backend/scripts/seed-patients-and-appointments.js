// backend/scripts/seed-patients-and-appointments.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample patient data
const patientsData = [
  {
    user: {
      firstName: 'Arjun',
      lastName: 'Verma',
      email: 'arjun.verma@gmail.com',
      phone: '9876543210',
      dateOfBirth: new Date('1995-03-15'),
      gender: 'male',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'O+',
      address: {
        street: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Sunita Verma',
        relationship: 'Mother',
        phone: '+91-9876543211'
      },
      medicalHistory: {
        allergies: ['Peanuts'],
        chronicConditions: [],
        previousSurgeries: [],
        currentMedications: []
      }
    }
  },
  {
    user: {
      firstName: 'Priya',
      lastName: 'Kapoor',
      email: 'priya.kapoor@gmail.com',
      phone: '9876543212',
      dateOfBirth: new Date('1992-07-22'),
      gender: 'female',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'A+',
      address: {
        street: '456 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700016',
        country: 'India'
      },
      emergencyContact: {
        name: 'Rajesh Kapoor',
        relationship: 'Father',
        phone: '+91-9876543213'
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: ['Migraine'],
        previousSurgeries: [],
        currentMedications: ['Sumatriptan']
      }
    }
  },
  {
    user: {
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@gmail.com',
      phone: '9876543214',
      dateOfBirth: new Date('1988-11-30'),
      gender: 'male',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'B+',
      address: {
        street: '789 Civil Lines',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110054',
        country: 'India'
      },
      emergencyContact: {
        name: 'Kavita Singh',
        relationship: 'Wife',
        phone: '+91-9876543215'
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        previousSurgeries: ['Appendectomy (2015)'],
        currentMedications: ['Amlodipine']
      }
    }
  },
  {
    user: {
      firstName: 'Ananya',
      lastName: 'Reddy',
      email: 'ananya.reddy@gmail.com',
      phone: '9876543216',
      dateOfBirth: new Date('1998-05-18'),
      gender: 'female',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'AB+',
      address: {
        street: '321 Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500033',
        country: 'India'
      },
      emergencyContact: {
        name: 'Lakshmi Reddy',
        relationship: 'Mother',
        phone: '+91-9876543217'
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: [],
        previousSurgeries: [],
        currentMedications: []
      }
    }
  },
  {
    user: {
      firstName: 'Rohit',
      lastName: 'Sharma',
      email: 'rohit.sharma@gmail.com',
      phone: '9876543218',
      dateOfBirth: new Date('1990-09-12'),
      gender: 'male',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'O-',
      address: {
        street: '567 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      },
      emergencyContact: {
        name: 'Ritika Sharma',
        relationship: 'Wife',
        phone: '+91-9876543219'
      },
      medicalHistory: {
        allergies: ['Dust', 'Pollen'],
        chronicConditions: ['Asthma'],
        previousSurgeries: [],
        currentMedications: ['Albuterol Inhaler']
      }
    }
  },
  {
    user: {
      firstName: 'Neha',
      lastName: 'Gupta',
      email: 'neha.gupta@gmail.com',
      phone: '9876543220',
      dateOfBirth: new Date('1993-12-08'),
      gender: 'female',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'A-',
      address: {
        street: '890 Ashok Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600083',
        country: 'India'
      },
      emergencyContact: {
        name: 'Suresh Gupta',
        relationship: 'Father',
        phone: '+91-9876543221'
      },
      medicalHistory: {
        allergies: ['Shellfish'],
        chronicConditions: ['Diabetes Type 2'],
        previousSurgeries: [],
        currentMedications: ['Metformin']
      }
    }
  },
  {
    user: {
      firstName: 'Karan',
      lastName: 'Malhotra',
      email: 'karan.malhotra@gmail.com',
      phone: '9876543222',
      dateOfBirth: new Date('1985-04-25'),
      gender: 'male',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'B-',
      address: {
        street: '234 Sector 17',
        city: 'Chandigarh',
        state: 'Chandigarh',
        zipCode: '160017',
        country: 'India'
      },
      emergencyContact: {
        name: 'Preeti Malhotra',
        relationship: 'Wife',
        phone: '+91-9876543223'
      },
      medicalHistory: {
        allergies: [],
        chronicConditions: ['High Cholesterol'],
        previousSurgeries: ['Knee Surgery (2018)'],
        currentMedications: ['Atorvastatin']
      }
    }
  },
  {
    user: {
      firstName: 'Ishita',
      lastName: 'Joshi',
      email: 'ishita.joshi@gmail.com',
      phone: '9876543224',
      dateOfBirth: new Date('1996-08-14'),
      gender: 'female',
      role: 'patient'
    },
    patient: {
      bloodGroup: 'AB-',
      address: {
        street: '678 FC Road',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411004',
        country: 'India'
      },
      emergencyContact: {
        name: 'Amit Joshi',
        relationship: 'Father',
        phone: '+91-9876543225'
      },
      medicalHistory: {
        allergies: ['Latex'],
        chronicConditions: [],
        previousSurgeries: [],
        currentMedications: []
      }
    }
  }
];

const createPatients = async () => {
  const createdPatients = [];
  
  for (const patientData of patientsData) {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: patientData.user.email });
      
      if (!user) {
        // Hash password
        const hashedPassword = await bcrypt.hash('patient123', 10);
        
        // Create user
        user = await User.create({
          ...patientData.user,
          password: hashedPassword,
          isActive: true
        });
        
        console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`ℹ️  User already exists: ${user.firstName} ${user.lastName}`);
      }
      
      // Check if patient profile exists
      let patient = await Patient.findOne({ user: user._id });
      
      if (!patient) {
        // Create patient profile
        patient = await Patient.create({
          user: user._id,
          ...patientData.patient
        });
        
        console.log(`✅ Created patient profile for: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`ℹ️  Patient profile already exists for: ${user.firstName} ${user.lastName}`);
      }
      
      createdPatients.push(patient);
    } catch (error) {
      console.error(`❌ Error creating patient ${patientData.user.email}:`, error.message);
    }
  }
  
  return createdPatients;
};

const generateTimeSlot = (baseHour, slotIndex) => {
  const hour = baseHour + Math.floor(slotIndex / 2);
  const minute = (slotIndex % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getRandomSymptoms = () => {
  const symptoms = [
    'Fever and body aches',
    'Severe headache and dizziness',
    'Chest pain and breathing difficulty',
    'Abdominal pain and nausea',
    'Persistent cough and cold',
    'Back pain and muscle strain',
    'Skin rash and allergies',
    'Joint pain and swelling',
    'High blood pressure checkup',
    'Diabetes follow-up',
    'Regular health checkup',
    'Migraine and vision problems',
    'Throat infection',
    'Ear pain',
    'Dental pain',
    'Anxiety and stress',
  ];
  return symptoms[Math.floor(Math.random() * symptoms.length)];
};

const getRandomStatus = (dayOffset) => {
  // Past appointments: completed or cancelled
  if (dayOffset < 0) {
    return Math.random() > 0.2 ? 'completed' : 'cancelled';
  }
  // Today's appointments: mix of confirmed and scheduled
  if (dayOffset === 0) {
    const rand = Math.random();
    if (rand > 0.7) return 'confirmed';
    if (rand > 0.4) return 'scheduled';
    return 'completed';
  }
  // Future appointments: scheduled or confirmed
  return Math.random() > 0.5 ? 'scheduled' : 'confirmed';
};

const seedAppointments = async (patients, doctors) => {
  const appointments = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('\n📅 Generating appointments...');

  // Generate appointments for each doctor
  for (const doctor of doctors) {
    console.log(`\n👨‍⚕️ Doctor: ${doctor.user.firstName} ${doctor.user.lastName}`);
    
    // Generate appointments for 7 days (2 past, today, 4 future)
    for (let dayOffset = -2; dayOffset <= 4; dayOffset++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(appointmentDate.getDate() + dayOffset);
      
      // Skip if it's Sunday (day 0)
      if (appointmentDate.getDay() === 0) {
        console.log(`   ⏭️  Skipping Sunday (${appointmentDate.toDateString()})`);
        continue;
      }

      // Generate 3-4 appointments per day
      const appointmentsPerDay = Math.floor(Math.random() * 2) + 3; // 3 or 4
      
      console.log(`   📆 ${appointmentDate.toDateString()} - ${appointmentsPerDay} appointments`);

      for (let i = 0; i < appointmentsPerDay; i++) {
        // Select random patient from the real patients
        const patient = patients[Math.floor(Math.random() * patients.length)];
        
        // Generate time slot (9 AM to 5 PM, 30-min slots)
        const timeSlot = generateTimeSlot(9, Math.floor(Math.random() * 16));
        
        // Check if appointment already exists for this doctor/time
        const existingAppointment = appointments.find(
          apt => 
            apt.doctor.toString() === doctor._id.toString() &&
            apt.appointmentDate.getTime() === appointmentDate.getTime() &&
            apt.appointmentTime === timeSlot
        );

        if (existingAppointment) {
          // Skip duplicate slot
          i--;
          continue;
        }

        const status = getRandomStatus(dayOffset);
        
        // Generate unique appointment ID
        const appointmentId = `APT${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        const symptoms = getRandomSymptoms();
        
        const appointment = {
          appointmentId: appointmentId,
          patient: patient._id,
          doctor: doctor._id,
          appointmentDate: appointmentDate,
          appointmentTime: timeSlot,
          reasonForVisit: symptoms,
          symptoms: [symptoms],
          appointmentType: 'in-person',
          duration: 30,
          status: status,
          notes: status === 'completed' ? 'Checkup completed successfully' : '',
        };

        // Add cancellation details if cancelled
        if (status === 'cancelled') {
          appointment.cancellationReason = 'Patient requested cancellation';
          appointment.cancelledBy = 'patient';
          appointment.cancelledAt = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
        }

        appointments.push(appointment);
      }
    }
  }

  return appointments;
};

const main = async () => {
  try {
    await connectDB();

    console.log('\n🗑️  Step 1: Clearing existing appointments...');
    const deletedCount = await Appointment.deleteMany({});
    console.log(`✅ Deleted ${deletedCount.deletedCount} existing appointments`);

    console.log('\n👥 Step 2: Creating real patients...');
    const patients = await createPatients();
    console.log(`\n✅ Total patients available: ${patients.length}`);

    console.log('\n👨‍⚕️ Step 3: Fetching doctors...');
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName');
    console.log(`✅ Found ${doctors.length} doctors`);

    if (doctors.length === 0) {
      console.log('❌ No doctors found in database');
      process.exit(1);
    }

    if (patients.length === 0) {
      console.log('❌ No patients available');
      process.exit(1);
    }

    console.log('\n📅 Step 4: Generating appointments...');
    const appointments = await seedAppointments(patients, doctors);

    console.log(`\n💾 Step 5: Inserting ${appointments.length} appointments into database...`);
    await Appointment.insertMany(appointments);

    console.log('\n✅ ✅ ✅ ALL DONE! ✅ ✅ ✅');
    console.log('\n📊 Summary:');
    console.log(`   👥 Patients Created/Used: ${patients.length}`);
    console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`   📅 Total Appointments: ${appointments.length}`);
    
    // Count by status
    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Appointments By Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n🔐 Patient Login Credentials:');
    console.log('   Email: arjun.verma@gmail.com');
    console.log('   Email: priya.kapoor@gmail.com');
    console.log('   Email: vikram.singh@gmail.com');
    console.log('   Email: ananya.reddy@gmail.com');
    console.log('   Email: rohit.sharma@gmail.com');
    console.log('   Email: neha.gupta@gmail.com');
    console.log('   Email: karan.malhotra@gmail.com');
    console.log('   Email: ishita.joshi@gmail.com');
    console.log('   Password: patient123 (for all)');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
main();
