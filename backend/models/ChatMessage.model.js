// backend/models/ChatMessage.model.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  // Session ID (groups messages in a conversation)
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // User/Patient
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Message Content
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  
  // Sender Type
  senderType: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  
  // Language
  language: {
    type: String,
    enum: ['english', 'hindi'],
    default: 'english'
  },
  
  // Message Type
  messageType: {
    type: String,
    enum: ['text', 'voice', 'quick_reply', 'button_response'],
    default: 'text'
  },
  
  // Voice Input (if applicable)
  voiceInput: {
    audioUrl: String,
    duration: Number, // in seconds
    transcription: String
  },
  
  // Intent Detected (by AI)
  intent: {
    name: String,
    confidence: Number,
    entities: [{
      type: String,
      value: String,
      confidence: Number
    }]
  },
  
  // Bot Response Metadata
  botResponse: {
    generatedBy: {
      type: String,
      enum: ['rule_based', 'ai_model', 'api'],
      default: 'ai_model'
    },
    model: String, // e.g., "gpt-3.5-turbo", "custom-medical-bot"
    processingTime: Number, // in milliseconds
    confidence: Number
  },
  
  // Quick Reply Options (if bot provides options)
  quickReplies: [{
    text: String,
    value: String
  }],
  
  // Actions/Buttons
  actions: [{
    type: {
      type: String,
      enum: ['book_appointment', 'view_doctors', 'view_prescriptions', 'emergency', 'other']
    },
    label: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Related Entities (if message refers to specific data)
  relatedEntities: [{
    entityType: {
      type: String,
      enum: ['doctor', 'appointment', 'symptom', 'disease', 'medication']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityData: mongoose.Schema.Types.Mixed
  }],
  
  // Feedback
  feedback: {
    isHelpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  
  // Flagging (for inappropriate content)
  flagged: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    reason: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date
  },
  
  // Conversation Context
  context: {
    previousIntent: String,
    conversationState: String,
    userPreferences: mongoose.Schema.Types.Mixed
  },
  
  // Medical Information Provided
  medicalInfo: {
    symptoms: [String],
    suggestedDiseases: [String],
    recommendedActions: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency']
    }
  },
  
  // Analytics
  analytics: {
    responseTime: Number, // Time taken by user to respond (in seconds)
    userSatisfaction: Number,
    conversationLength: Number // Total messages in session
  },
  
  // Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Error (if any)
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if message is from bot
chatMessageSchema.virtual('isBot').get(function() {
  return this.senderType === 'bot';
});

// Virtual to check if message is recent (within 5 minutes)
chatMessageSchema.virtual('isRecent').get(function() {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  return this.timestamp >= fiveMinutesAgo;
});

// Index for faster queries
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ user: 1, timestamp: -1 });
chatMessageSchema.index({ senderType: 1 });
chatMessageSchema.index({ 'intent.name': 1 });
chatMessageSchema.index({ 'flagged.isFlagged': 1 });

// Method to add feedback
chatMessageSchema.methods.addFeedback = function(isHelpful, rating, comment) {
  this.feedback = {
    isHelpful: isHelpful,
    rating: rating,
    comment: comment,
    submittedAt: new Date()
  };
  return this.save();
};

// Method to flag message
chatMessageSchema.methods.flag = function(reason, flaggedBy) {
  this.flagged = {
    isFlagged: true,
    reason: reason,
    flaggedBy: flaggedBy,
    flaggedAt: new Date()
  };
  return this.save();
};

// Method to unflag message
chatMessageSchema.methods.unflag = function() {
  this.flagged = {
    isFlagged: false
  };
  return this.save();
};

// Static method to get conversation by session
chatMessageSchema.statics.getConversation = function(sessionId, limit = 100) {
  return this.find({ sessionId: sessionId })
    .sort({ timestamp: 1 })
    .limit(limit);
};

// Static method to get user's chat sessions
chatMessageSchema.statics.getUserSessions = function(userId) {
  return this.aggregate([
    { $match: { user: userId } },
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$sessionId',
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$timestamp' },
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { lastMessageTime: -1 } }
  ]);
};

// Static method to get recent conversations for user
chatMessageSchema.statics.getRecentConversations = function(userId, days = 7) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    user: userId,
    timestamp: { $gte: dateThreshold }
  })
  .sort({ timestamp: -1 })
  .limit(100);
};

// Static method to get flagged messages
chatMessageSchema.statics.getFlaggedMessages = function() {
  return this.find({ 'flagged.isFlagged': true })
    .populate('user', 'firstName lastName email')
    .populate('flagged.flaggedBy', 'firstName lastName')
    .sort({ 'flagged.flaggedAt': -1 });
};

// Static method to get messages with low confidence
chatMessageSchema.statics.getLowConfidenceMessages = function(threshold = 0.5) {
  return this.find({
    senderType: 'bot',
    'botResponse.confidence': { $lt: threshold }
  })
  .sort({ timestamp: -1 })
  .limit(100);
};

// Static method to get analytics for a time period
chatMessageSchema.statics.getAnalytics = async function(startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        totalSessions: { $addToSet: '$sessionId' },
        totalUsers: { $addToSet: '$user' },
        avgResponseTime: { $avg: '$botResponse.processingTime' },
        totalHelpfulFeedback: {
          $sum: { $cond: ['$feedback.isHelpful', 1, 0] }
        },
        totalUnhelpfulFeedback: {
          $sum: { $cond: [{ $eq: ['$feedback.isHelpful', false] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalMessages: 1,
        totalSessions: { $size: '$totalSessions' },
        totalUsers: { $size: '$totalUsers' },
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        helpfulnessRate: {
          $cond: [
            { $eq: [{ $add: ['$totalHelpfulFeedback', '$totalUnhelpfulFeedback'] }, 0] },
            0,
            {
              $multiply: [
                {
                  $divide: [
                    '$totalHelpfulFeedback',
                    { $add: ['$totalHelpfulFeedback', '$totalUnhelpfulFeedback'] }
                  ]
                },
                100
              ]
            }
          ]
        }
      }
    }
  ]);
  
  return result[0] || {};
};

// Static method to get common intents
chatMessageSchema.statics.getCommonIntents = function(limit = 10) {
  return this.aggregate([
    {
      $match: {
        senderType: 'user',
        'intent.name': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$intent.name',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$intent.confidence' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;