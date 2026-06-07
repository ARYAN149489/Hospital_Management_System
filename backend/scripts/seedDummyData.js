// backend/scripts/seedDummyData.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Appointment = require('../models/Appointment.model');
const Prescription = require('../models/Prescription.model');
const LabTest = require('../models/LabTest.model');
const MedicalRecord = require('../models/MedicalRecord.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDummyData = async () => {
  try {
    console.log('🌱 Starting to seed dummy data...\n');

    // Get all patients and doctors
    const patients = await Patient.find().populate('user');
    const doctors = await Doctor.find().populate('user');

    if (patients.length === 0) {
      console.log('⚠️  No patients found. Please register some patients first.');
      return;
    }

    if (doctors.length === 0) {
      console.log('⚠️  No doctors found. Please run seedDoctors.js first.');
      return;
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors\n`);

    // Clear existing dummy data (optional - comment out if you want to keep existing data)
    // await Appointment.deleteMany({});
    // await Prescription.deleteMany({});
    // await LabTest.deleteMany({});
    // await MedicalRecord.deleteMany({});
    // console.log('🗑️  Cleared existing data\n');

    // ==================== SEED APPOINTMENTS ====================
    console.log('📅 Seeding Appointments...');
    const appointmentStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    const appointmentTypes = ['consultation', 'follow_up', 'emergency'];
    const appointments = [];

    // Create at least 15 appointments to ensure we have past, present, and future
    const numAppointments = Math.max(15, patients.length * 3);
    
    for (let i = 0; i < numAppointments; i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      
      // Create appointments distributed across time
      // i 0-4: Past appointments (completed)
      // i 5-9: Today's appointments (confirmed)
      // i 10+: Future appointments (scheduled)
      let daysOffset;
      let status;
      
      if (i < 5) {
        // Past appointments
        daysOffset = -(i + 1); // -1 to -5 days
        status = 'completed';
      } else if (i < 10) {
        // Today's appointments
        daysOffset = 0;
        status = 'confirmed';
      } else {
        // Future appointments
        daysOffset = (i - 9); // +1, +2, +3... days
        status = 'scheduled';
      }
      
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);
      
      const appointment = new Appointment({
        appointmentId: `APT${Date.now()}${i}`,
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: appointmentDate,
        appointmentTime: `${9 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
        appointmentType: i % 3 === 0 ? 'video' : 'in-person',
        reasonForVisit: `${appointmentTypes[i % appointmentTypes.length] === 'consultation' ? 'General checkup and consultation' : appointmentTypes[i % appointmentTypes.length] === 'follow_up' ? 'Follow-up visit for previous treatment' : 'Urgent medical attention required'}`,
        symptoms: [['Fever', 'Headache'], ['Fatigue', 'Cough'], ['Body ache', 'Nausea'], ['Chest pain'], ['Dizziness']][i % 5],
        status: status,
        consultationNotes: status === 'completed' ? 'Consultation completed successfully' : undefined,
        patientNotes: 'Patient reported improvement in symptoms',
        payment: {
          amount: 500 + (i * 100),
          status: status === 'completed' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
          method: status === 'completed' ? ['upi', 'card', 'cash'][i % 3] : undefined,
          paidAt: status === 'completed' ? appointmentDate : undefined
        }
      });

      appointments.push(appointment);
    }

    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} appointments\n`);

    // ==================== SEED PRESCRIPTIONS ====================
    console.log('💊 Seeding Prescriptions...');
    const prescriptions = [];
    const completedAppointments = await Appointment.find({ status: 'completed' }).limit(10);

    for (let i = 0; i < completedAppointments.length; i++) {
      const appointment = completedAppointments[i];
      
      const prescription = new Prescription({
        prescriptionId: `RX${Date.now()}${i}`,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment: appointment._id,
        prescriptionDate: appointment.appointmentDate,
        diagnosis: [
          'Common Cold',
          'Hypertension',
          'Type 2 Diabetes',
          'Allergic Rhinitis',
          'Gastritis',
          'Migraine',
          'Anxiety Disorder',
          'Lower Back Pain'
        ][i % 8],
        medications: [
          {
            name: ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Lisinopril'][i % 5],
            dosage: ['500mg', '400mg', '250mg', '850mg', '10mg'][i % 5],
            frequency: ['Twice daily', 'Three times daily', 'Once daily', 'Every 8 hours'][i % 4],
            duration: `${7 + (i % 7)} days`,
            instructions: 'Take after meals with water',
            quantity: 10 + (i * 5)
          },
          {
            name: ['Vitamin D', 'Calcium', 'Multivitamin', 'Omega-3'][i % 4],
            dosage: '1 tablet',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take in the morning',
            quantity: 30
          }
        ],
        additionalInstructions: 'Complete the full course of medication. Avoid alcohol. Drink plenty of water.',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active'
      });

      prescriptions.push(prescription);
    }

    await Prescription.insertMany(prescriptions);
    console.log(`✅ Created ${prescriptions.length} prescriptions\n`);

    // ==================== SEED LAB TESTS ====================
    console.log('🧪 Seeding Lab Tests...');
    const labTests = [];
    const testStatuses = ['pending', 'sample_collected', 'in_progress', 'completed'];
    const testTypes = [
      'Complete Blood Count (CBC)',
      'Lipid Profile',
      'Liver Function Test',
      'Kidney Function Test',
      'Thyroid Profile',
      'Blood Sugar (Fasting)',
      'HbA1c',
      'Vitamin D',
      'Vitamin B12',
      'Urine Routine'
    ];

    for (let i = 0; i < Math.min(12, patients.length * 2); i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      const status = testStatuses[i % testStatuses.length];
      
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - (10 - i));

      const labTest = new LabTest({
        labTestId: `LAB${Date.now()}${i}`,
        patient: patient._id,
        prescribedBy: doctor._id,
        testName: testTypes[i % testTypes.length],
        testCategory: ['Blood Test', 'Urine Test', 'Imaging', 'Culture Test'][i % 4],
        labName: ['Apollo Diagnostics', 'Thyrocare', 'Dr. Lal PathLabs', 'Metropolis Healthcare'][i % 4],
        scheduledDate: testDate,
        scheduledTime: `${9 + (i % 6)}:00`,
        testStatus: status,
        sampleCollectionDate: status !== 'pending' ? testDate : undefined,
        resultDate: status === 'completed' ? new Date(testDate.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined,
        specialInstructions: 'Fasting required for 8-12 hours before the test',
        payment: {
          amount: 500 + (i * 100),
          status: status === 'completed' ? 'paid' : 'pending',
          method: status === 'completed' ? ['upi', 'card', 'cash'][i % 3] : undefined,
          paidAt: status === 'completed' ? testDate : undefined
        },
        results: status === 'completed' ? [
          {
            parameter: 'Hemoglobin',
            value: '14.5',
            unit: 'g/dL',
            normalRange: '13-17',
            status: 'normal'
          },
          {
            parameter: 'WBC Count',
            value: '8500',
            unit: 'cells/µL',
            normalRange: '4000-11000',
            status: 'normal'
          }
        ] : [],
        resultSummary: status === 'completed' ? {
          overallStatus: i % 5 === 0 ? 'abnormal' : 'normal',
          interpretation: 'All parameters within normal range',
          recommendations: 'Continue with current lifestyle and diet'
        } : undefined,
        report: status === 'completed' ? {
          url: `/uploads/lab-reports/report-${i}.pdf`,
          generatedAt: new Date(testDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        } : undefined
      });

      labTests.push(labTest);
    }

    await LabTest.insertMany(labTests);
    console.log(`✅ Created ${labTests.length} lab tests\n`);

    // ==================== SEED MEDICAL RECORDS ====================
    console.log('📋 Seeding Medical Records...');
    const medicalRecords = [];
    const recordTypes = ['lab_report', 'prescription', 'imaging', 'consultation_notes', 'vaccination_record', 'discharge_summary'];

    for (let i = 0; i < Math.min(10, patients.length * 2); i++) {
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      
      const recordDate = new Date();
      recordDate.setDate(recordDate.getDate() - (30 - i * 3));

      const medicalRecord = new MedicalRecord({
        recordId: `MR${Date.now()}${i}`,
        patient: patient._id,
        recordType: recordTypes[i % recordTypes.length],
        title: [
          'Annual Health Checkup Report',
          'Blood Test Results',
          'X-Ray Chest Report',
          'Vaccination Record',
          'Discharge Summary - General Surgery',
          'MRI Scan Report',
          'ECG Report',
          'Ultrasound Report'
        ][i % 8],
        description: 'Medical record uploaded for patient reference',
        recordDate: recordDate,
        uploadedBy: {
          userType: 'doctor',
          userId: doctor._id
        },
        file: {
          filename: `medical-record-${i}.pdf`,
          originalName: `medical-record-${i}.pdf`,
          url: `/uploads/medical-records/record-${i}.pdf`,
          size: 1024 * (100 + i * 50), // bytes
          mimeType: 'application/pdf'
        },
        tags: ['checkup', 'report', 'test', 'imaging']
      });

      medicalRecords.push(medicalRecord);
    }

    await MedicalRecord.insertMany(medicalRecords);
    console.log(`✅ Created ${medicalRecords.length} medical records\n`);

    console.log('✨ Dummy data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${appointments.length} Appointments`);
    console.log(`   - ${prescriptions.length} Prescriptions`);
    console.log(`   - ${labTests.length} Lab Tests`);
    console.log(`   - ${medicalRecords.length} Medical Records`);

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

// Run the seed function
connectDB().then(() => {
  seedDummyData();
});
