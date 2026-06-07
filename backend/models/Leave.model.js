// backend/models/Leave.model.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  // Leave ID (unique identifier)
  leaveId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Doctor Reference
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  
  // Leave Type
  leaveType: {
    type: String,
    enum: [
      'sick_leave',
      'casual_leave',
      'vacation',
      'emergency',
      'maternity',
      'paternity',
      'compensatory',
      'unpaid',
      'other'
    ],
    required: [true, 'Leave type is required']
  },
  
  // Leave Duration
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
  // Half day leave options
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first_half', 'second_half'],
    required: function() {
      return this.isHalfDay === true;
    }
  },
  
  // Total Days
  totalDays: {
    type: Number,
    required: true
  },
  
  // Reason
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    minlength: [10, 'Reason must be at least 10 characters']
  },
  
  // Supporting Documents
  documents: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Approval Details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  approvalComments: String,
  
  // Rejection Details
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  rejectedAt: Date,
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Cancellation Details
  cancelledAt: Date,
  cancellationReason: String,
  
  // Contact Information during leave
  contactDuringLeave: {
    available: {
      type: Boolean,
      default: false
    },
    phone: String,
    email: String,
    emergencyOnly: {
      type: Boolean,
      default: false
    }
  },
  
  // Substitute Doctor (if assigned)
  substituteDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  // Appointments Affected
  affectedAppointments: [{
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    action: {
      type: String,
      enum: ['cancelled', 'rescheduled', 'reassigned'],
    },
    actionDate: Date
  }],
  
  // Priority
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  // Applied Date
  appliedDate: {
    type: Date,
    default: Date.now
  },
  
  // Notification Status
  notificationSent: {
    toAdmin: {
      type: Boolean,
      default: false
    },
    toPatients: {
      type: Boolean,
      default: false
    },
    approval: {
      type: Boolean,
      default: false
    },
    rejection: {
      type: Boolean,
      default: false
    }
  },
  
  // Notes
  internalNotes: String, // Admin notes
  doctorNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if leave is upcoming
leaveSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startDate && this.status === 'approved';
});

// Virtual to check if leave is active
leaveSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && this.status === 'approved';
});

// Virtual to check if leave is past
leaveSchema.virtual('isPast').get(function() {
  return new Date() > this.endDate;
});

// Virtual to get days remaining until leave starts
leaveSchema.virtual('daysUntilLeave').get(function() {
  if (this.status !== 'approved') return null;
  
  const now = new Date();
  const diff = this.startDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Calculate total days before saving
leaveSchema.pre('save', async function(next) {
  // Generate unique leave ID
  if (this.isNew && !this.leaveId) {
    const count = await mongoose.model('Leave').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.leaveId = `LV${date}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate total days
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('isHalfDay')) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Calculate days difference
    const timeDiff = end - start;
    let days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // Adjust for half day
    if (this.isHalfDay) {
      days = 0.5;
    }
    
    this.totalDays = days;
  }
  
  next();
});

// Validate end date is after start date
leaveSchema.pre('validate', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Index for faster queries
leaveSchema.index({ doctor: 1, startDate: -1 });
// leaveSchema.index({ leaveId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

// Method to approve leave
leaveSchema.methods.approve = function(adminId, comments) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  this.notificationSent.approval = false; // Will be sent by notification service
};

// Method to reject leave
leaveSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.notificationSent.rejection = false; // Will be sent by notification service
};

// Method to cancel leave
leaveSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
};

// Method to check if leave overlaps with another leave
leaveSchema.methods.overlapsWithLeave = async function(doctorId) {
  const Leave = mongoose.model('Leave');
  
  const overlappingLeaves = await Leave.find({
    doctor: doctorId,
    _id: { $ne: this._id }, // Exclude current leave
    status: { $in: ['pending', 'approved'] },
    $or: [
      {
        // New leave starts within existing leave
        startDate: { $lte: this.endDate },
        endDate: { $gte: this.startDate }
      }
    ]
  });
  
  return overlappingLeaves.length > 0;
};

// Static method to get pending leaves
leaveSchema.statics.getPendingLeaves = function() {
  return this.find({ status: 'pending' })
    .populate('doctor')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName email' }
    })
    .sort({ appliedDate: 1 });
};

// Static method to get approved leaves for a doctor
leaveSchema.statics.getApprovedLeavesForDoctor = function(doctorId) {
  return this.find({
    doctor: doctorId,
    status: 'approved',
    endDate: { $gte: new Date() }
  })
  .sort({ startDate: 1 });
};

// Static method to get active leaves
leaveSchema.statics.getActiveLeaves = function() {
  const now = new Date();
  
  return this.find({
    status: 'approved',
    startDate: { $lte: now },
    endDate: { $gte: now }
  })
  .populate('doctor')
  .populate({
    path: 'doctor',
    populate: { path: 'user', select: 'firstName lastName' }
  });
};

// Static method to check if doctor is on leave on a specific date
leaveSchema.statics.isDoctorOnLeave = async function(doctorId, date) {
  const count = await this.countDocuments({
    doctor: doctorId,
    status: 'approved',
    startDate: { $lte: date },
    endDate: { $gte: date }
  });
  
  return count > 0;
};

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;