// backend/models/Admin.model.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // Reference to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Admin ID (unique identifier)
  adminId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Admin Role/Type
  adminRole: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  
  // Permissions
  permissions: {
    canApproveDoctor: {
      type: Boolean,
      default: true
    },
    canManageUsers: {
      type: Boolean,
      default: true
    },
    canManageDepartments: {
      type: Boolean,
      default: true
    },
    canApproveLeaves: {
      type: Boolean,
      default: true
    },
    canViewAnalytics: {
      type: Boolean,
      default: true
    },
    canManageSettings: {
      type: Boolean,
      default: false // Only super admin
    },
    canDeleteRecords: {
      type: Boolean,
      default: false // Only super admin
    },
    canManageAdmins: {
      type: Boolean,
      default: false // Only super admin
    }
  },
  
  // Department Assignment (optional)
  assignedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  
  // Activity Tracking
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['user', 'doctor', 'patient', 'appointment', 'leave', 'department', 'system']
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  
  // Statistics
  stats: {
    totalDoctorsApproved: {
      type: Number,
      default: 0
    },
    totalDoctorsRejected: {
      type: Number,
      default: 0
    },
    totalLeavesApproved: {
      type: Number,
      default: 0
    },
    totalLeavesRejected: {
      type: Number,
      default: 0
    },
    totalUsersManaged: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedUntil: Date,
  suspensionReason: String,
  
  // Created by (for tracking admin hierarchy)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Last Activity
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastLoginIP: String,
  
  // Notes (internal)
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique admin ID
adminSchema.pre('save', async function(next) {
  if (this.isNew && !this.adminId) {
    const count = await mongoose.model('Admin').countDocuments();
    this.adminId = `ADM${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for faster queries
// adminSchema.index({ user: 1 });
// adminSchema.index({ adminId: 1 });
adminSchema.index({ adminRole: 1 });
adminSchema.index({ isActive: 1 });

// Method to log activity
adminSchema.methods.logActivity = function(action, targetType, targetId, description, ipAddress) {
  this.activityLog.push({
    action,
    targetType,
    targetId,
    description,
    timestamp: new Date(),
    ipAddress
  });
  
  this.lastActivity = new Date();
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

// Method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  // Super admin has all permissions
  if (this.adminRole === 'super_admin') return true;
  
  // Check if admin is suspended
  if (this.isSuspended) {
    if (this.suspendedUntil && new Date() < this.suspendedUntil) {
      return false;
    }
  }
  
  // Check specific permission
  return this.permissions[permission] === true;
};

// Method to check if admin can perform action
adminSchema.methods.canPerformAction = function(action) {
  if (!this.isActive || this.isSuspended) return false;
  
  const actionPermissionMap = {
    'approve_doctor': 'canApproveDoctor',
    'manage_users': 'canManageUsers',
    'manage_departments': 'canManageDepartments',
    'approve_leaves': 'canApproveLeaves',
    'view_analytics': 'canViewAnalytics',
    'manage_settings': 'canManageSettings',
    'delete_records': 'canDeleteRecords',
    'manage_admins': 'canManageAdmins'
  };
  
  const permission = actionPermissionMap[action];
  return permission ? this.hasPermission(permission) : false;
};

// Method to increment stats
adminSchema.methods.incrementStat = function(statName) {
  if (this.stats[statName] !== undefined) {
    this.stats[statName] += 1;
  }
};

// Static method to get active admins
adminSchema.statics.getActiveAdmins = function() {
  return this.find({ isActive: true, isSuspended: false })
    .populate('user', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
};

// Static method to get super admins
adminSchema.statics.getSuperAdmins = function() {
  return this.find({ adminRole: 'super_admin', isActive: true })
    .populate('user', 'firstName lastName email phone');
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;