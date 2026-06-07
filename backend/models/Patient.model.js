// backend/models/Patient.model.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Patient ID (unique identifier)
  patientId: {
    type: String,
    unique: true,
    required: false  // Will be auto-generated in pre-save hook
  },
  
  // Medical Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  
  // Medical History
  allergies: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    notes: String
  }],
  
  chronicDiseases: [{
    name: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'controlled', 'resolved'],
      default: 'active'
    },
    notes: String
  }],
  
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  
  pastSurgeries: [{
    name: String,
    date: Date,
    hospital: String,
    doctor: String,
    notes: String
  }],
  
  // Family Medical History
  familyHistory: [{
    relation: String,
    condition: String,
    notes: String
  }],
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    email: String
  },
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    validUntil: Date,
    coverageAmount: Number
  },
  
  // Preferences
  preferredLanguage: {
    type: String,
    enum: ['english', 'hindi'],
    default: 'english'
  },
  
  // Statistics
  totalAppointments: {
    type: Number,
    default: 0
  },
  totalPrescriptions: {
    type: Number,
    default: 0
  },
  totalLabTests: {
    type: Number,
    default: 0
  },
  
  // Status
  registrationStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for patient name
patientSchema.virtual('name').get(function() {
  if (this.user && this.user.firstName && this.user.lastName) {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
  return '';
});

// Virtual for patient phone
patientSchema.virtual('phone').get(function() {
  return this.user?.phone || '';
});

// Virtual for patient email
patientSchema.virtual('email').get(function() {
  return this.user?.email || '';
});

// Virtual populate for appointments
patientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'patient'
});

// Virtual populate for prescriptions
patientSchema.virtual('prescriptions', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'patient'
});

// Virtual populate for medical records
patientSchema.virtual('medicalRecords', {
  ref: 'MedicalRecord',
  localField: '_id',
  foreignField: 'patient'
});

// Generate unique patient ID
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for faster queries
// patientSchema.index({ user: 1 });
// patientSchema.index({ patientId: 1 });
patientSchema.index({ bloodGroup: 1 });

// Calculate BMI
patientSchema.methods.calculateBMI = function() {
  if (!this.height?.value || !this.weight?.value) return null;
  
  let heightInMeters = this.height.value;
  if (this.height.unit === 'ft') {
    heightInMeters = this.height.value * 0.3048;
  } else {
    heightInMeters = this.height.value / 100;
  }
  
  let weightInKg = this.weight.value;
  if (this.weight.unit === 'lbs') {
    weightInKg = this.weight.value * 0.453592;
  }
  
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
};

// Get BMI category
patientSchema.methods.getBMICategory = function() {
  const bmi = this.calculateBMI();
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;