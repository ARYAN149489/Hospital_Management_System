// backend/models/BlockedSlot.model.js
const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
  // Doctor Reference
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  // Day of week
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  
  // Time slot
  startTime: {
    type: String, // Format: "14:00"
    required: true
  },
  endTime: {
    type: String, // Format: "15:00"
    required: true
  },
  
  // Reason for blocking
  reason: {
    type: String,
    trim: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
blockedSlotSchema.index({ doctor: 1, day: 1, isActive: 1 });

module.exports = mongoose.model('BlockedSlot', blockedSlotSchema);
