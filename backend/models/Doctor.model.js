// backend/models/Doctor.model.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Doctor ID (unique identifier)
  doctorId: {
    type: String,
    unique: true,
    required: false  // Will be auto-generated in pre-save hook
  },
  
  // Professional Information
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false  // Make optional for now
  },
  
  // Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  
  // Registration & License
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  medicalCouncilRegistration: {
    type: String,
    required: false
  },
  licenseValidUntil: {
    type: Date,
    required: false
  },
  
  // Experience
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  previousWorkplaces: [{
    hospital: String,
    position: String,
    from: Date,
    to: Date
  }],
  
  // Consultation Details
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  consultationDuration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Availability
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    slots: [{
      startTime: {
        type: String, // Format: "09:00"
        required: true
      },
      endTime: {
        type: String, // Format: "17:00"
        required: true
      }
    }],
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Services Offered
  servicesOffered: [{
    type: String
  }],
  
  // Languages Spoken
  languages: [{
    type: String,
    enum: ['english', 'hindi', 'punjabi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'urdu', 'kannada', 'malayalam', 'other']
  }],
  
  // Rating & Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Statistics
  totalPatients: {
    type: Number,
    default: 0
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  
  // Professional Details
  bio: {
    type: String,
    maxlength: 1000
  },
  achievements: [{
    title: String,
    year: Number,
    description: String
  }],
  
  // Documents
  documents: {
    degreeCertificate: String,
    licenseCertificate: String,
    identityProof: String,
    otherCertificates: [String]
  },
  
  // Approval Status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvalDate: Date,
  rejectionReason: String,
  
  // Block Status
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  blockReason: {
    type: String,
    default: null
  },
  
  // Leave Management
  currentLeaveStatus: {
    type: String,
    enum: ['available', 'on_leave'],
    default: 'available'
  },
  totalLeaveDays: {
    type: Number,
    default: 0
  },
  
  // Preferences
  maxAppointmentsPerDay: {
    type: Number,
    default: 20
  },
  allowOnlineConsultation: {
    type: Boolean,
    default: true
  },
  allowEmergencyAppointments: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for appointments
doctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor'
});

// Virtual populate for leaves
doctorSchema.virtual('leaves', {
  ref: 'Leave',
  localField: '_id',
  foreignField: 'doctor'
});

// Virtual populate for prescriptions
doctorSchema.virtual('prescriptions', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'doctor'
});

// Generate unique doctor ID
doctorSchema.pre('save', async function(next) {
  if (this.isNew && !this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for faster queries
// doctorSchema.index({ user: 1 });
// doctorSchema.index({ doctorId: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ approvalStatus: 1 });
doctorSchema.index({ 'rating.average': -1 });

// Method to check if doctor is available on a specific date and time
doctorSchema.methods.isAvailableAt = function(date, time) {
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  
  const dayAvailability = this.availability.find(a => a.day === dayName && a.isAvailable);
  if (!dayAvailability) return false;
  
  return dayAvailability.slots.some(slot => {
    return time >= slot.startTime && time <= slot.endTime;
  });
};

// Method to get available slots for a specific day
doctorSchema.methods.getAvailableSlotsForDay = function(dayName) {
  const dayAvailability = this.availability.find(a => a.day === dayName && a.isAvailable);
  return dayAvailability ? dayAvailability.slots : [];
};

// Method to calculate average rating
doctorSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;