// backend/scripts/seed-appointments.js
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const Appointment = require('../models/Appointment.model');
const Department = require('../models/Department.model');
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

const seedAppointments = async () => {
  try {
    await connectDB();

    console.log('🔄 Fetching doctors and patients...');
    
    const doctors = await Doctor.find()
      .populate('user', 'firstName lastName')
      .populate('department', 'name');
    
    const patients = await Patient.find()
      .populate('user', 'firstName lastName phone');

    if (doctors.length === 0) {
      console.log('❌ No doctors found in database');
      process.exit(1);
    }

    if (patients.length === 0) {
      console.log('❌ No patients found in database');
      process.exit(1);
    }

    console.log(`✅ Found ${doctors.length} doctors and ${patients.length} patients`);

    // Clear existing appointments (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing appointments...');
    await Appointment.deleteMany({});

    const appointments = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate appointments for each doctor
    for (const doctor of doctors) {
      console.log(`\n📅 Generating appointments for Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
      
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
          // Select random patient
          const patient = patients[Math.floor(Math.random() * patients.length)];
          
          // Generate time slot (9 AM to 5 PM, 30-min slots)
          const timeSlot = generateTimeSlot(9, Math.floor(Math.random() * 16));
          
          // Check if appointment already exists
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
          const appointmentId = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;
          
          const symptoms = getRandomSymptoms();
          
          const appointment = {
            appointmentId: appointmentId,
            patient: patient._id,
            doctor: doctor._id,
            department: doctor.department?._id,
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
            appointment.cancelledAt = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // Cancelled 1 day before
          }

          appointments.push(appointment);
        }
      }
    }

    console.log(`\n💾 Inserting ${appointments.length} appointments into database...`);
    await Appointment.insertMany(appointments);

    console.log('\n✅ Appointments seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total Appointments: ${appointments.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Patients: ${patients.length}`);
    
    // Count by status
    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 By Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    process.exit(1);
  }
};

// Run the script
seedAppointments();
