// Create realistic patient accounts with appointments, prescriptions, and medical data
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Patient = require('./models/Patient.model');
const Doctor = require('./models/Doctor.model');
const Appointment = require('./models/Appointment.model');
const Prescription = require('./models/Prescription.model');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Patient data templates
const patientsData = [
  {
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'rahul.verma@example.com',
    phone: '9876543210',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    bloodGroup: 'B+',
    address: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    medicalHistory: ['Hypertension', 'Diabetes Type 2'],
    allergies: [
      { name: 'Penicillin', severity: 'severe' }
    ],
    currentMedications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    ]
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '9876543211',
    dateOfBirth: '1990-08-22',
    gender: 'female',
    bloodGroup: 'A+',
    address: {
      street: '456 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    medicalHistory: ['Asthma'],
    allergies: [
      { name: 'Pollen', severity: 'moderate' },
      { name: 'Dust', severity: 'mild' }
    ],
    currentMedications: [
      { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed' }
    ]
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@example.com',
    phone: '9876543212',
    dateOfBirth: '1978-12-10',
    gender: 'male',
    bloodGroup: 'O+',
    address: {
      street: '789 Gandhi Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380001',
      country: 'India'
    },
    medicalHistory: ['High Cholesterol', 'Heart Disease'],
    allergies: [
      { name: 'Shellfish', severity: 'severe' }
    ],
    currentMedications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily' }
    ]
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@example.com',
    phone: '9876543213',
    dateOfBirth: '1995-03-18',
    gender: 'female',
    bloodGroup: 'AB+',
    address: {
      street: '321 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500033',
      country: 'India'
    },
    medicalHistory: ['Migraine'],
    allergies: [],
    currentMedications: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed for migraine' }
    ]
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh.new@example.com',
    phone: '9876543214',
    dateOfBirth: '1982-07-25',
    gender: 'male',
    bloodGroup: 'A-',
    address: {
      street: '654 Civil Lines',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110054',
      country: 'India'
    },
    medicalHistory: ['Back Pain', 'Arthritis'],
    allergies: [
      { name: 'Latex', severity: 'moderate' }
    ],
    currentMedications: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Three times daily' }
    ]
  },
  {
    firstName: 'Anjali',
    lastName: 'Mehta',
    email: 'anjali.mehta@example.com',
    phone: '9876543215',
    dateOfBirth: '1988-11-30',
    gender: 'female',
    bloodGroup: 'B-',
    address: {
      street: '987 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400020',
      country: 'India'
    },
    medicalHistory: ['Thyroid Disorder'],
    allergies: [
      { name: 'Iodine', severity: 'mild' }
    ],
    currentMedications: [
      { name: 'Levothyroxine', dosage: '100mcg', frequency: 'Once daily before breakfast' }
    ]
  }
];

// Appointment reasons for different specializations
const appointmentReasons = {
  'Cardiology': [
    'Regular heart checkup',
    'Chest pain evaluation',
    'Blood pressure monitoring',
    'ECG follow-up',
    'Cardiac stress test'
  ],
  'Neurology': [
    'Headache consultation',
    'Migraine treatment',
    'Seizure evaluation',
    'Nerve pain assessment',
    'Memory issues consultation'
  ],
  'Pediatrics': [
    'General health checkup',
    'Vaccination',
    'Growth monitoring',
    'Fever evaluation',
    'Nutritional consultation'
  ],
  'Orthopedics': [
    'Joint pain assessment',
    'Back pain consultation',
    'Fracture follow-up',
    'Arthritis treatment',
    'Sports injury evaluation'
  ],
  'Dermatology': [
    'Skin rash consultation',
    'Acne treatment',
    'Hair loss evaluation',
    'Mole examination',
    'Allergy testing'
  ],
  'General Medicine': [
    'Routine health checkup',
    'Fever and cold',
    'Diabetes management',
    'Hypertension follow-up',
    'General consultation'
  ]
};

// Prescription templates
const prescriptionTemplates = [
  {
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after meals' }
    ],
    diagnosis: 'Fever and body ache',
    notes: 'Rest and plenty of fluids recommended'
  },
  {
    medications: [
      { name: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Complete the course' },
      { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '5 days', instructions: 'For pain relief' }
    ],
    diagnosis: 'Bacterial infection',
    notes: 'Follow-up if symptoms persist'
  },
  {
    medications: [
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days', instructions: 'Take before breakfast' }
    ],
    diagnosis: 'Gastritis',
    notes: 'Avoid spicy foods and alcohol'
  },
  {
    medications: [
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days', instructions: 'Take at bedtime' }
    ],
    diagnosis: 'Allergic reaction',
    notes: 'Avoid known allergens'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✓ MongoDB Connected${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ MongoDB Connection Error:${colors.reset}`, error.message);
    process.exit(1);
  }
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

const getRandomTime = () => {
  const hours = 9 + Math.floor(Math.random() * 8); // 9am to 4pm
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

const createPatientAccount = async (patientData) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: patientData.email });
    let patient = null;
    
    if (user) {
      console.log(`${colors.yellow}⚠ User ${patientData.email} already exists${colors.reset}`);
      // Check if patient profile exists
      patient = await Patient.findOne({ user: user._id });
      if (patient) {
        console.log(`${colors.yellow}⚠ Patient profile already exists, skipping...${colors.reset}`);
        return { user, patient };
      }
      console.log(`${colors.cyan}Creating patient profile for existing user...${colors.reset}`);
    } else {
      // Create User account
      user = new User({
        email: patientData.email,
        password: 'Patient@123', // Will be hashed by pre-save hook
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        dateOfBirth: new Date(patientData.dateOfBirth),
        gender: patientData.gender,
        role: 'patient',
        isActive: true,
        isEmailVerified: true,
        address: patientData.address
      });

      await user.save();
      console.log(`${colors.green}✓ Created user account: ${patientData.email}${colors.reset}`);
    }

    // Create Patient profile
    const patientId = `PAT-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    patient = new Patient({
      user: user._id,
      userId: user._id,
      patientId: patientId,
      dateOfBirth: new Date(patientData.dateOfBirth),
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      emergencyContact: {
        name: `Emergency Contact for ${patientData.firstName}`,
        relationship: 'Family',
        phone: '9999999999'
      },
      allergies: patientData.allergies,
      currentMedications: patientData.currentMedications
    });

    await patient.save();
    console.log(`${colors.green}✓ Created patient profile: ${patientId}${colors.reset}`);

    return { user, patient };
  } catch (error) {
    console.error(`${colors.red}✗ Error creating patient:${colors.reset}`, error.message);
    throw error;
  }
};

const createAppointments = async (patient, user, doctors) => {
  const appointments = [];
  const appointmentDates = [
    { offset: -1, label: 'Yesterday' },
    { offset: -1, label: 'Yesterday' },
    { offset: 0, label: 'Today' },
    { offset: 0, label: 'Today' },
    { offset: 1, label: 'Tomorrow' },
    { offset: 1, label: 'Tomorrow' }
  ];

  console.log(`${colors.cyan}Creating appointments for ${user.firstName}...${colors.reset}`);

  for (let i = 0; i < appointmentDates.length; i++) {
    try {
      const doctor = getRandomElement(doctors);
      const dateInfo = appointmentDates[i];
      const appointmentDate = getRandomDate(dateInfo.offset);
      const time = getRandomTime();
      
      // Get appropriate reason based on doctor's specialization
      const specialization = doctor.specialization || 'General Medicine';
      const reasons = appointmentReasons[specialization] || appointmentReasons['General Medicine'];
      const reason = getRandomElement(reasons);

      // Determine status based on date
      let status = 'scheduled';
      if (dateInfo.offset < 0) {
        status = Math.random() < 0.7 ? 'completed' : 'cancelled';
      } else if (dateInfo.offset === 0) {
        status = Math.random() < 0.5 ? 'confirmed' : 'scheduled';
      }

      const appointment = new Appointment({
        appointmentId: `APT-${Date.now()}${Math.floor(Math.random() * 10000)}`,
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: appointmentDate,
        appointmentTime: time,
        appointmentType: Math.random() < 0.8 ? 'in-person' : 'emergency',
        reasonForVisit: reason,
        status: status,
        duration: 30,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Created within last week
      });

      // Add completion details for completed appointments
      if (status === 'completed') {
        appointment.checkOutTime = appointmentDate;
        appointment.notes = `${reason} - Patient examined and treated successfully.`;
        appointment.diagnosis = `Diagnosed with ${reason.toLowerCase()}`;
      }

      // Add cancellation details for cancelled appointments
      if (status === 'cancelled') {
        appointment.cancelledAt = appointmentDate;
        appointment.cancelledBy = Math.random() < 0.5 ? 'patient' : 'doctor';
        appointment.cancellationReason = 'Personal emergency';
      }

      await appointment.save();
      appointments.push(appointment);

      console.log(`  ${colors.green}✓${colors.reset} ${dateInfo.label}: ${status} - ${doctor.user.firstName} ${doctor.user.lastName} (${specialization})`);

      // Add small delay to ensure unique appointment IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`  ${colors.red}✗ Error creating appointment:${colors.reset}`, error.message);
    }
  }

  return appointments;
};

const createPrescriptions = async (patient, appointments, doctors) => {
  const prescriptions = [];
  
  // Create prescriptions for completed appointments
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  
  console.log(`${colors.cyan}Creating prescriptions for ${completedAppointments.length} completed appointments...${colors.reset}`);

  for (const appointment of completedAppointments) {
    try {
      const doctor = doctors.find(d => d._id.toString() === appointment.doctor.toString());
      const template = getRandomElement(prescriptionTemplates);

      const prescription = new Prescription({
        prescriptionId: `RX-${Date.now()}${Math.floor(Math.random() * 10000)}`,
        patient: patient._id,
        doctor: appointment.doctor,
        appointment: appointment._id,
        prescriptionDate: appointment.appointmentDate,
        diagnosis: template.diagnosis,
        medications: template.medications,
        notes: template.notes,
        validUntil: new Date(appointment.appointmentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
        status: 'active'
      });

      await prescription.save();
      prescriptions.push(prescription);

      console.log(`  ${colors.green}✓${colors.reset} Prescription for ${template.diagnosis}`);

      // Add small delay
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`  ${colors.red}✗ Error creating prescription:${colors.reset}`, error.message);
    }
  }

  return prescriptions;
};

const createMedicalRecords = async (patient, user) => {
  // Skip medical records creation as it requires file uploads
  // Medical records will be added through the UI with actual file uploads
  console.log(`${colors.cyan}Skipping medical records (requires file uploads)${colors.reset}`);
  return [];
};

const main = async () => {
  try {
    console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     Creating Realistic Patient Accounts & Data        ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    await connectDB();

    // Get all doctors
    const doctors = await Doctor.find().populate('user', 'firstName lastName email');
    
    if (doctors.length === 0) {
      console.log(`${colors.red}✗ No doctors found in database. Please create doctors first.${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.green}✓ Found ${doctors.length} doctors${colors.reset}\n`);

    let totalCreated = 0;
    let totalAppointments = 0;
    let totalPrescriptions = 0;
    let totalRecords = 0;

    // Create each patient with full data
    for (const patientData of patientsData) {
      console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
      console.log(`${colors.blue}Creating patient: ${patientData.firstName} ${patientData.lastName}${colors.reset}`);
      console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

      try {
        // Create patient account
        const { user, patient } = await createPatientAccount(patientData);
        
        if (!patient) {
          continue; // Skip if patient already existed
        }

        totalCreated++;

        // Create appointments
        const appointments = await createAppointments(patient, user, doctors);
        totalAppointments += appointments.length;

        // Create prescriptions
        const prescriptions = await createPrescriptions(patient, appointments, doctors);
        totalPrescriptions += prescriptions.length;

        // Create medical records
        const records = await createMedicalRecords(patient, user);
        totalRecords += records.length;

        console.log(`${colors.green}\n✓ Successfully created complete profile for ${user.firstName} ${user.lastName}${colors.reset}`);
        console.log(`  - Appointments: ${appointments.length}`);
        console.log(`  - Prescriptions: ${prescriptions.length}`);
        console.log(`  - Medical Records: ${records.length}\n`);

      } catch (error) {
        console.error(`${colors.red}✗ Error creating patient ${patientData.firstName}:${colors.reset}`, error.message);
      }
    }

    // Summary
    console.log(`${colors.blue}\n╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║                   CREATION SUMMARY                     ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.green}✓ Patients Created: ${totalCreated}${colors.reset}`);
    console.log(`${colors.green}✓ Total Appointments: ${totalAppointments}${colors.reset}`);
    console.log(`${colors.green}✓ Total Prescriptions: ${totalPrescriptions}${colors.reset}`);
    console.log(`${colors.green}✓ Total Medical Records: ${totalRecords}${colors.reset}`);
    console.log(`\n${colors.cyan}Default Password for all patients: Patient@123${colors.reset}\n`);

    // Display patient credentials
    console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║                  PATIENT CREDENTIALS                   ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    patientsData.forEach((patient, index) => {
      console.log(`${colors.cyan}${index + 1}. ${patient.firstName} ${patient.lastName}${colors.reset}`);
      console.log(`   Email: ${patient.email}`);
      console.log(`   Password: Patient@123`);
      console.log(`   Phone: ${patient.phone}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}✗ Fatal Error:${colors.reset}`, error);
    process.exit(1);
  }
};

// Run the script
main();
