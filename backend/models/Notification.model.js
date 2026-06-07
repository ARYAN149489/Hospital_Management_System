// backend/models/Notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_rescheduled',
      'appointment_reminder',
      'prescription_added',
      'lab_test_booked',
      'lab_test_result',
      'medical_record_added',
      'leave_applied',
      'leave_approved',
      'leave_rejected',
      'doctor_approved',
      'doctor_rejected',
      'payment_success',
      'payment_failed',
      'general',
      'system'
    ],
    required: [true, 'Notification type is required']
  },
  
  // Title and Message
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  
  // Related Entity (for deep linking)
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['appointment', 'prescription', 'labtest', 'leave', 'medicalrecord', 'payment', 'user', 'doctor', 'patient']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Action Link
  actionUrl: String,
  actionText: String,
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Delivery Channels
  channels: {
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      emailId: String // Message ID from email service
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      messageId: String // Message ID from SMS service
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      messageId: String // Message ID from push service
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Sender (if applicable)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Scheduled Notification
  scheduledFor: Date,
  
  // Expiry
  expiresAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'expired'],
    default: 'sent'
  },
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryAt: Date,
  
  // Error Information
  error: {
    message: String,
    code: String,
    timestamp: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual to check if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return this.createdAt >= oneDayAgo;
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Automatically mark expired notifications
notificationSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt && this.status !== 'expired') {
    this.status = 'expired';
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Method to send via email
notificationSchema.methods.sendEmail = async function(emailService) {
  try {
    const result = await emailService.send({
      to: this.recipient.email,
      subject: this.title,
      body: this.message
    });
    
    this.channels.email.sent = true;
    this.channels.email.sentAt = new Date();
    this.channels.email.emailId = result.messageId;
    
    await this.save();
    return true;
  } catch (error) {
    this.error = {
      message: error.message,
      code: error.code,
      timestamp: new Date()
    };
    await this.save();
    return false;
  }
};

// Method to send via SMS
notificationSchema.methods.sendSMS = async function(smsService) {
  try {
    const result = await smsService.send({
      to: this.recipient.phone,
      message: this.message
    });
    
    this.channels.sms.sent = true;
    this.channels.sms.sentAt = new Date();
    this.channels.sms.messageId = result.messageId;
    
    await this.save();
    return true;
  } catch (error) {
    this.error = {
      message: error.message,
      code: error.code,
      timestamp: new Date()
    };
    await this.save();
    return false;
  }
};

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = function(userId, limit = 50) {
  return this.find({
    recipient: userId,
    isRead: false,
    status: { $in: ['sent', 'delivered'] },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get all notifications for user
notificationSchema.statics.getAllForUser = function(userId, limit = 100) {
  return this.find({
    recipient: userId,
    status: { $in: ['sent', 'delivered'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    status: { $in: ['sent', 'delivered'] },
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Static method to delete old notifications (older than 90 days)
notificationSchema.statics.deleteOldNotifications = function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to get notifications by type
notificationSchema.statics.getByType = function(userId, type, limit = 50) {
  return this.find({
    recipient: userId,
    type: type,
    status: { $in: ['sent', 'delivered'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;