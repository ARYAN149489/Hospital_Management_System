// backend/models/Appointment.model.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Appointment ID (unique identifier)
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Patient and Doctor References
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
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String, // Format: "14:30"
    required: [true, 'Appointment time is required']
  },
  
  // Duration
  duration: {
    type: Number, // in minutes
    default: 30
  },
  
  // Type of Appointment
  appointmentType: {
    type: String,
    enum: ['in-person', 'emergency'],
    default: 'in-person',
    required: true
  },
  
  // Reason for Visit
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    trim: true
  },
  symptoms: [{
    type: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  
  // Cancellation Details
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'system'],
  },
  cancelledAt: Date,
  
  // Reschedule Details
  rescheduledFrom: {
    date: Date,
    time: String
  },
  rescheduledReason: String,
  
  // Check-in/Check-out
  checkInTime: Date,
  checkOutTime: Date,
  
  // Consultation Details (filled by doctor after appointment)
  diagnosis: String,
  notes: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Prescription Reference
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  
  // Lab Tests Recommended
  labTestsRecommended: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  
  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Rating (after appointment)
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  // Queue Number (for in-person appointments)
  queueNumber: Number,
  
  // Internal Notes (visible only to doctor/admin)
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate time until appointment
appointmentSchema.virtual('timeUntilAppointment').get(function() {
  if (!this.appointmentTime) return 0;
  
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(hours, minutes);
  
  const diff = appointmentDateTime - now;
  return diff > 0 ? diff : 0;
});

// Virtual to check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
});

// Virtual to check if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  if (!this.appointmentTime) return false;
  
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(hours, minutes);
  
  return appointmentDateTime > now;
});

// Generate unique appointment ID
appointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.appointmentId = `APT${date}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Index for faster queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
// appointmentSchema.index({ appointmentId: 1 });

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  if (['completed', 'cancelled', 'no-show'].includes(this.status)) {
    return false;
  }
  
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(hours, minutes);
  
  // Can't cancel if appointment is in less than 2 hours
  const diff = appointmentDateTime - now;
  return diff > (2 * 60 * 60 * 1000); // 2 hours in milliseconds
};

// Method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function() {
  if (['completed', 'cancelled', 'no-show'].includes(this.status)) {
    return false;
  }
  
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(hours, minutes);
  
  // Can't reschedule if appointment is in less than 4 hours
  const diff = appointmentDateTime - now;
  return diff > (4 * 60 * 60 * 1000); // 4 hours in milliseconds
};

// Method to calculate actual duration
appointmentSchema.methods.getActualDuration = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    return Math.round(diff / (1000 * 60)); // in minutes
  }
  return null;
};

// Static method to get today's appointments for a doctor
appointmentSchema.statics.getTodayAppointmentsForDoctor = function(doctorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    doctor: doctorId,
    appointmentDate: { $gte: today, $lt: tomorrow },
    status: { $nin: ['cancelled', 'no-show'] }
  })
  .populate('patient')
  .sort({ appointmentTime: 1 });
};

// Static method to get upcoming appointments for a patient
appointmentSchema.statics.getUpcomingAppointmentsForPatient = function(patientId) {
  const now = new Date();
  
  return this.find({
    patient: patientId,
    appointmentDate: { $gte: now },
    status: { $nin: ['cancelled', 'no-show', 'completed'] }
  })
  .populate('doctor')
  .sort({ appointmentDate: 1, appointmentTime: 1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;