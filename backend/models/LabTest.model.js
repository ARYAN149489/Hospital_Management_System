// backend/models/LabTest.model.js
const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  // Lab Test ID (unique identifier)
  labTestId: {
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
  
  // Prescribed by Doctor (optional - can be self-booked)
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  // Associated Prescription/Appointment
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Test Information
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  testCategory: {
    type: String,
    enum: [
      'Blood Test',
      'Urine Test',
      'Stool Test',
      'Imaging',
      'Biopsy',
      'Culture Test',
      'Genetic Test',
      'Allergy Test',
      'COVID-19 Test',
      'Other'
    ],
    required: true
  },
  testCode: String,
  
  // Lab Details
  labName: {
    type: String,
    required: [true, 'Lab name is required']
  },
  labAddress: String,
  labPhone: String,
  
  // Booking Details
  bookingDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  
  // Test Type
  testType: {
    type: String,
    enum: ['home_collection', 'lab_visit', 'hospital'],
    default: 'lab_visit'
  },
  
  // Home Collection Address (if applicable)
  collectionAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'booked',
      'sample_collected',
      'processing',
      'completed',
      'cancelled',
      'report_ready'
    ],
    default: 'booked'
  },
  
  // Sample Collection
  sampleCollection: {
    collectedAt: Date,
    collectedBy: String,
    sampleType: String,
    sampleId: String
  },
  
  // Results
  results: [{
    parameter: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'low', 'high', 'abnormal', 'critical'],
      default: 'normal'
    },
    notes: String
  }],
  
  // Overall Result Summary
  resultSummary: {
    overallStatus: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal'
    },
    interpretation: String,
    recommendations: String
  },
  
  // Report
  report: {
    url: String,
    uploadedAt: Date,
    generatedAt: Date
  },
  
  // Lab Technician/Pathologist Details
  testedBy: {
    name: String,
    qualification: String,
    signature: String
  },
  verifiedBy: {
    name: String,
    qualification: String,
    signature: String,
    verifiedAt: Date
  },
  
  // Special Instructions
  specialInstructions: String,
  fastingRequired: {
    type: Boolean,
    default: false
  },
  preparationInstructions: String,
  
  // Payment
  payment: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'net_banking', 'insurance']
    },
    transactionId: String,
    paidAt: Date,
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: Number
  },
  
  // Cancellation
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['patient', 'lab', 'admin']
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  // Notification
  notificationSent: {
    booking: { type: Boolean, default: false },
    sampleCollection: { type: Boolean, default: false },
    reportReady: { type: Boolean, default: false }
  },
  
  // Notes
  internalNotes: String,
  patientNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if test is upcoming
labTestSchema.virtual('isUpcoming').get(function() {
  if (this.status !== 'booked') return false;
  
  const now = new Date();
  const testDateTime = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  testDateTime.setHours(hours, minutes);
  
  return testDateTime > now;
});

// Virtual to check if result is critical
labTestSchema.virtual('hasCriticalResults').get(function() {
  return this.results.some(result => result.status === 'critical') || 
         this.resultSummary.overallStatus === 'critical';
});

// Virtual to check if fasting is needed
labTestSchema.virtual('requiresFasting').get(function() {
  return this.fastingRequired === true;
});

// Generate unique lab test ID
labTestSchema.pre('save', async function(next) {
  if (this.isNew && !this.labTestId) {
    const count = await mongoose.model('LabTest').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.labTestId = `LT${date}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate final amount
  if (this.payment && this.payment.amount) {
    this.payment.finalAmount = this.payment.amount - (this.payment.discount || 0);
  }
  
  next();
});

// Index for faster queries
labTestSchema.index({ patient: 1, scheduledDate: -1 });
// labTestSchema.index({ labTestId: 1 });
labTestSchema.index({ status: 1 });
labTestSchema.index({ testCategory: 1 });
labTestSchema.index({ priority: 1 });

// Method to cancel test
labTestSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: cancelledBy,
    reason: reason
  };
  
  // Calculate refund if payment was made
  if (this.payment.status === 'paid') {
    const hoursDiff = (this.scheduledDate - new Date()) / (1000 * 60 * 60);
    
    // Full refund if cancelled 24 hours before
    if (hoursDiff >= 24) {
      this.cancellation.refundAmount = this.payment.finalAmount;
    } 
    // 50% refund if cancelled 12-24 hours before
    else if (hoursDiff >= 12) {
      this.cancellation.refundAmount = this.payment.finalAmount * 0.5;
    } 
    // No refund if less than 12 hours
    else {
      this.cancellation.refundAmount = 0;
    }
    
    this.cancellation.refundStatus = 'pending';
  }
};

// Method to update status
labTestSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Send notifications based on status
  if (newStatus === 'sample_collected') {
    this.notificationSent.sampleCollection = false; // Will be sent by notification service
  } else if (newStatus === 'report_ready') {
    this.notificationSent.reportReady = false; // Will be sent by notification service
  }
};

// Static method to get upcoming tests for patient
labTestSchema.statics.getUpcomingTests = function(patientId) {
  const now = new Date();
  
  return this.find({
    patient: patientId,
    scheduledDate: { $gte: now },
    status: { $in: ['booked', 'sample_collected'] }
  })
  .populate('prescribedBy')
  .sort({ scheduledDate: 1 });
};

// Static method to get tests by status
labTestSchema.statics.getTestsByStatus = function(patientId, status) {
  return this.find({
    patient: patientId,
    status: status
  })
  .sort({ scheduledDate: -1 });
};

// Static method to get critical results
labTestSchema.statics.getCriticalResults = function(patientId) {
  return this.find({
    patient: patientId,
    $or: [
      { 'results.status': 'critical' },
      { 'resultSummary.overallStatus': 'critical' }
    ],
    status: 'completed'
  })
  .sort({ scheduledDate: -1 });
};

const LabTest = mongoose.model('LabTest', labTestSchema);

module.exports = LabTest;