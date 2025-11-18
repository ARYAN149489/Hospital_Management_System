// backend/models/MedicalRecord.model.js
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Record ID (unique identifier)
  recordId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Patient Reference
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  
  // Doctor who uploaded/created the record
  uploadedBy: {
    userType: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'uploadedBy.userType'
    }
  },
  
  // Record Type
  recordType: {
    type: String,
    enum: [
      'lab_report',
      'prescription',
      'imaging',
      'discharge_summary',
      'consultation_notes',
      'vaccination_record',
      'surgical_report',
      'pathology_report',
      'insurance_document',
      'other'
    ],
    required: [true, 'Record type is required']
  },
  
  // Title and Description
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Date of the medical event/test
  recordDate: {
    type: Date,
    required: [true, 'Record date is required']
  },
  
  // File Information
  file: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number, // in bytes
      required: true
    },
    cloudinaryId: String // if using Cloudinary
  },
  
  // Associated Appointment/Doctor
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  hospital: String,
  
  // Lab Test Details (if applicable)
  labTestDetails: {
    testName: String,
    testCategory: String,
    labName: String,
    results: [{
      parameter: String,
      value: String,
      unit: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical'],
        default: 'normal'
      }
    }]
  },
  
  // Imaging Details (if applicable)
  imagingDetails: {
    imagingType: {
      type: String,
      enum: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Other']
    },
    bodyPart: String,
    findings: String,
    radiologistName: String
  },
  
  // Vaccination Details (if applicable)
  vaccinationDetails: {
    vaccineName: String,
    doseNumber: Number,
    manufacturer: String,
    batchNumber: String,
    nextDoseDate: Date
  },
  
  // Tags for easy searching
  tags: [{
    type: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  
  // Visibility
  visibility: {
    type: String,
    enum: ['private', 'shared_with_doctors', 'public'],
    default: 'private'
  },
  
  // Shared with specific doctors
  sharedWith: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Notes
  notes: String,
  
  // Critical flag
  isCritical: {
    type: Boolean,
    default: false
  },
  
  // Verification (for authenticity)
  verified: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    verifiedAt: Date
  },
  
  // Archive details
  archivedAt: Date,
  archivedReason: String,
  
  // View count
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Last viewed
  lastViewedAt: Date,
  lastViewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get file size in readable format
medicalRecordSchema.virtual('fileSizeReadable').get(function() {
  const bytes = this.file.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual to check if record is recent (within 30 days)
medicalRecordSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.recordDate >= thirtyDaysAgo;
});

// Generate unique record ID
medicalRecordSchema.pre('save', async function(next) {
  if (this.isNew && !this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.recordId = `MR${date}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for faster queries
medicalRecordSchema.index({ patient: 1, recordDate: -1 });
medicalRecordSchema.index({ recordType: 1 });
// medicalRecordSchema.index({ recordId: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ tags: 1 });

// Method to archive record
medicalRecordSchema.methods.archive = function(reason) {
  this.status = 'archived';
  this.archivedAt = new Date();
  this.archivedReason = reason;
};

// Method to share with doctor
medicalRecordSchema.methods.shareWithDoctor = function(doctorId, expiresInDays = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  this.sharedWith.push({
    doctor: doctorId,
    expiresAt: expiresAt
  });
};

// Method to increment view count
medicalRecordSchema.methods.recordView = function(userId) {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  this.lastViewedBy = userId;
};

// Static method to get records by type for patient
medicalRecordSchema.statics.getRecordsByType = function(patientId, recordType) {
  return this.find({
    patient: patientId,
    recordType: recordType,
    status: 'active'
  })
  .sort({ recordDate: -1 });
};

// Static method to get recent records
medicalRecordSchema.statics.getRecentRecords = function(patientId, days = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    patient: patientId,
    recordDate: { $gte: dateThreshold },
    status: 'active'
  })
  .sort({ recordDate: -1 });
};

// Static method to search records
medicalRecordSchema.statics.searchRecords = function(patientId, searchTerm) {
  return this.find({
    patient: patientId,
    status: 'active',
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  })
  .sort({ recordDate: -1 });
};

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;