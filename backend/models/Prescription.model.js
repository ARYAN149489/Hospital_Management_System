// backend/models/Prescription.model.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  // Prescription ID (unique identifier)
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // References
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Can be created without appointment (follow-up)
  },
  
  // Prescription Date
  prescriptionDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Diagnosis
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  
  // Chief Complaints
  chiefComplaints: [{
    type: String
  }],
  
  // Vital Signs
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    pulse: Number, // beats per minute
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // SpO2 percentage
    weight: Number,
    height: Number
  },
  
  // Medications
  medications: [{
    name: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true,
      // Example: "3 times a day", "Once daily", "Every 6 hours"
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
      }
    },
    route: {
      type: String,
      enum: ['oral', 'topical', 'injection', 'inhalation', 'sublingual', 'rectal', 'other'],
      default: 'oral'
    },
    timing: {
      type: String,
      // Example: "Before meals", "After meals", "At bedtime"
    },
    instructions: String,
    quantity: Number
  }],
  
  // Lab Tests Recommended
  labTests: [{
    testName: String,
    reason: String,
    urgent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Advice/Instructions
  generalInstructions: String,
  dietaryAdvice: String,
  lifestyleRecommendations: [{
    type: String
  }],
  
  // Follow-up
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    after: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
      }
    },
    reason: String
  },
  
  // Notes (Doctor's notes)
  doctorNotes: String,
  
  // Allergies noted during prescription
  allergiesNoted: [{
    type: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'replaced'],
    default: 'active'
  },
  
  // Discontinuation details
  discontinuedDate: Date,
  discontinuedReason: String,
  discontinuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  // Replaced by (if updated prescription)
  replacedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  // Digital Signature
  digitalSignature: {
    signed: {
      type: Boolean,
      default: false
    },
    signedAt: Date,
    signatureUrl: String
  },
  
  // Document
  document: {
    url: String, // PDF URL
    generatedAt: Date
  },
  
  // Verification (for pharmacy)
  pharmacyVerification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String,
    verifiedAt: Date,
    pharmacyName: String
  },
  
  // Validity
  validUntil: {
    type: Date,
    required: true
  },
  
  // Is this an emergency prescription?
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  // Attachments (reports, images, etc.)
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if prescription is still valid
prescriptionSchema.virtual('isValid').get(function() {
  return new Date() <= this.validUntil && this.status === 'active';
});

// Virtual to get days remaining
prescriptionSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diff = this.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual to calculate total medications
prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications ? this.medications.length : 0;
});

// Generate unique prescription ID
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew && !this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.prescriptionId = `RX${date}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Set validity (default 30 days from prescription date)
  if (this.isNew && !this.validUntil) {
    this.validUntil = new Date(this.prescriptionDate);
    this.validUntil.setDate(this.validUntil.getDate() + 30);
  }
  
  next();
});

// Index for faster queries
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
// prescriptionSchema.index({ prescriptionId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ validUntil: 1 });

// Method to discontinue prescription
prescriptionSchema.methods.discontinue = function(reason, doctorId) {
  this.status = 'discontinued';
  this.discontinuedDate = new Date();
  this.discontinuedReason = reason;
  this.discontinuedBy = doctorId;
};

// Method to check if any medication has specific drug
prescriptionSchema.methods.hasMedication = function(medicationName) {
  return this.medications.some(med => 
    med.name.toLowerCase().includes(medicationName.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(medicationName.toLowerCase())
  );
};

// Static method to get active prescriptions for patient
prescriptionSchema.statics.getActivePrescriptionsForPatient = function(patientId) {
  return this.find({
    patient: patientId,
    status: 'active',
    validUntil: { $gte: new Date() }
  })
  .populate('doctor', 'user specialization')
  .populate({
    path: 'doctor',
    populate: { path: 'user', select: 'firstName lastName' }
  })
  .sort({ prescriptionDate: -1 });
};

// Static method to get prescriptions by doctor
prescriptionSchema.statics.getPrescriptionsByDoctor = function(doctorId, limit = 50) {
  return this.find({ doctor: doctorId })
    .populate('patient', 'user')
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName dateOfBirth' }
    })
    .sort({ prescriptionDate: -1 })
    .limit(limit);
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;