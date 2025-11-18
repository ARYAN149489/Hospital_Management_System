// Script to identify and remove fake/dummy prescriptions
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.model');
const Prescription = require('./models/Prescription.model');
const Doctor = require('./models/Doctor.model');
const Patient = require('./models/Patient.model');

async function cleanupFakePrescriptions() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all prescriptions
    const allPrescriptions = await Prescription.find()
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 });

    console.log(`📊 Total prescriptions found: ${allPrescriptions.length}\n`);

    // Identify fake prescriptions
    // Real prescriptions should have:
    // 1. Valid doctor and patient references
    // 2. Proper medications array with name, dosage, frequency, duration
    // 3. Diagnosis field
    // 4. prescriptionId format like RX20251114-0003

    const fakePrescriptions = [];
    const realPrescriptions = [];

    for (const prescription of allPrescriptions) {
      let isFake = false;
      const reasons = [];

      // Check if doctor exists and has valid user
      if (!prescription.doctor || !prescription.doctor.user) {
        isFake = true;
        reasons.push('Missing doctor or doctor.user');
      }

      // Check if patient exists and has valid user
      if (!prescription.patient || !prescription.patient.user) {
        isFake = true;
        reasons.push('Missing patient or patient.user');
      }

      // Check if medications array is properly structured
      if (!prescription.medications || prescription.medications.length === 0) {
        isFake = true;
        reasons.push('No medications');
      } else {
        // Check if medications have proper structure
        const hasProperMedications = prescription.medications.every(med => 
          med.name && 
          med.dosage && 
          med.frequency && 
          (med.duration || (med.duration && med.duration.value))
        );
        
        if (!hasProperMedications) {
          isFake = true;
          reasons.push('Medications missing required fields (name, dosage, frequency, duration)');
        }
      }

      // Check if diagnosis exists
      if (!prescription.diagnosis || prescription.diagnosis.trim().length < 5) {
        isFake = true;
        reasons.push('Missing or invalid diagnosis');
      }

      if (isFake) {
        fakePrescriptions.push({
          id: prescription._id,
          prescriptionId: prescription.prescriptionId,
          diagnosis: prescription.diagnosis,
          medicationsCount: prescription.medications?.length || 0,
          doctor: prescription.doctor?.user ? `${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}` : 'N/A',
          patient: prescription.patient?.user ? `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}` : 'N/A',
          reasons: reasons.join(', '),
          createdAt: prescription.createdAt
        });
      } else {
        realPrescriptions.push({
          id: prescription._id,
          prescriptionId: prescription.prescriptionId,
          diagnosis: prescription.diagnosis,
          medicationsCount: prescription.medications.length,
          doctor: `${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`,
          patient: `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`,
          createdAt: prescription.createdAt
        });
      }
    }

    console.log('🟢 REAL PRESCRIPTIONS:');
    console.log('='.repeat(80));
    if (realPrescriptions.length > 0) {
      realPrescriptions.forEach((p, index) => {
        console.log(`${index + 1}. ID: ${p.prescriptionId}`);
        console.log(`   Doctor: ${p.doctor}`);
        console.log(`   Patient: ${p.patient}`);
        console.log(`   Diagnosis: ${p.diagnosis}`);
        console.log(`   Medications: ${p.medicationsCount}`);
        console.log(`   Created: ${p.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No real prescriptions found.');
    }
    console.log(`Total Real: ${realPrescriptions.length}\n`);

    console.log('🔴 FAKE/DUMMY PRESCRIPTIONS:');
    console.log('='.repeat(80));
    if (fakePrescriptions.length > 0) {
      fakePrescriptions.forEach((p, index) => {
        console.log(`${index + 1}. ID: ${p.prescriptionId}`);
        console.log(`   Doctor: ${p.doctor}`);
        console.log(`   Patient: ${p.patient}`);
        console.log(`   Diagnosis: ${p.diagnosis || 'N/A'}`);
        console.log(`   Medications: ${p.medicationsCount}`);
        console.log(`   Reasons: ${p.reasons}`);
        console.log(`   Created: ${p.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No fake prescriptions found.');
    }
    console.log(`Total Fake: ${fakePrescriptions.length}\n`);

    if (fakePrescriptions.length > 0) {
      console.log('⚠️  WARNING: About to delete fake prescriptions!');
      console.log('Press Ctrl+C within 5 seconds to cancel...\n');
      
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('🗑️  Deleting fake prescriptions...');
      const fakeIds = fakePrescriptions.map(p => p.id);
      const deleteResult = await Prescription.deleteMany({ _id: { $in: fakeIds } });
      
      console.log(`✅ Deleted ${deleteResult.deletedCount} fake prescriptions\n`);
    } else {
      console.log('✅ No fake prescriptions to delete!\n');
    }

    console.log('📊 Summary:');
    console.log(`   Real prescriptions: ${realPrescriptions.length}`);
    console.log(`   Fake prescriptions deleted: ${fakePrescriptions.length}`);
    console.log(`   Remaining prescriptions: ${realPrescriptions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanupFakePrescriptions();
