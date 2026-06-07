// backend/models/Department.model.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Department Code (unique identifier)
  departmentCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true
  },
  
  // Department Name
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  
  // Description
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Icon/Image
  icon: String,
  image: String,
  
  // Services Offered
  services: [{
    name: String,
    description: String
  }],
  
  // Head of Department
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  // Contact Information
  contact: {
    phone: String,
    email: String,
    extension: String
  },
  
  // Location
  location: {
    building: String,
    floor: String,
    room: String
  },
  
  // Operating Hours
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    openTime: {
      type: String, // Format: "09:00"
      required: true
    },
    closeTime: {
      type: String, // Format: "17:00"
      required: true
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  }],
  
  // Emergency Services
  hasEmergencyServices: {
    type: Boolean,
    default: false
  },
  emergencyContact: String,
  
  // Statistics
  stats: {
    totalDoctors: {
      type: Number,
      default: 0
    },
    totalPatients: {
      type: Number,
      default: 0
    },
    totalAppointments: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance'],
    default: 'active'
  },
  
  // Bed Capacity (for departments with inpatient facility)
  bedCapacity: {
    total: {
      type: Number,
      default: 0
    },
    occupied: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  
  // Equipment
  equipment: [{
    name: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['operational', 'under_maintenance', 'out_of_order']
    }
  }],
  
  // Specializations under this department
  specializations: [{
    type: String
  }],
  
  // Common Conditions Treated
  commonConditions: [{
    type: String
  }],
  
  // Insurance Accepted
  insuranceAccepted: [{
    type: String
  }],
  
  // Order/Priority (for display)
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Featured Department
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Notes
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for doctors in this department
departmentSchema.virtual('doctors', {
  ref: 'Doctor',
  localField: '_id',
  foreignField: 'department'
});

// Virtual to get available beds percentage
departmentSchema.virtual('bedAvailabilityPercentage').get(function() {
  if (this.bedCapacity.total === 0) return 0;
  return Math.round((this.bedCapacity.available / this.bedCapacity.total) * 100);
});

// Virtual to check if department is open now
departmentSchema.virtual('isOpenNow').get(function() {
  if (!this.operatingHours || !Array.isArray(this.operatingHours)) {
    return false;
  }
  
  const now = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const todayHours = this.operatingHours.find(h => h.day === dayName && h.isOpen);
  if (!todayHours) return false;
  
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

// Generate department code before saving
departmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.departmentCode) {
    // Generate code from name (e.g., "Cardiology" -> "CARD")
    const code = this.name
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .map(word => word.substring(0, 2))
      .join('')
      .toUpperCase()
      .substring(0, 4);
    
    // Add number if code exists
    let finalCode = code;
    let counter = 1;
    
    while (await mongoose.model('Department').findOne({ departmentCode: finalCode })) {
      finalCode = `${code}${counter}`;
      counter++;
    }
    
    this.departmentCode = finalCode;
  }
  
  // Update available beds
  if (this.isModified('bedCapacity.total') || this.isModified('bedCapacity.occupied')) {
    this.bedCapacity.available = this.bedCapacity.total - this.bedCapacity.occupied;
  }
  
  next();
});

// Index for faster queries
// departmentSchema.index({ name: 1 });
// departmentSchema.index({ departmentCode: 1 });
departmentSchema.index({ status: 1 });
departmentSchema.index({ displayOrder: 1 });
departmentSchema.index({ isFeatured: 1 });

// Method to update doctor count
departmentSchema.methods.updateDoctorCount = async function() {
  const Doctor = mongoose.model('Doctor');
  const count = await Doctor.countDocuments({ 
    department: this._id, 
    approvalStatus: 'approved' 
  });
  
  this.stats.totalDoctors = count;
  await this.save();
};

// Method to check if department is available on a specific day
departmentSchema.methods.isAvailableOnDay = function(dayName) {
  const hours = this.operatingHours.find(h => h.day === dayName && h.isOpen);
  return hours !== undefined;
};

// Method to get operating hours for a specific day
departmentSchema.methods.getHoursForDay = function(dayName) {
  return this.operatingHours.find(h => h.day === dayName && h.isOpen);
};

// Method to update bed availability
departmentSchema.methods.updateBedAvailability = function(occupied) {
  this.bedCapacity.occupied = occupied;
  this.bedCapacity.available = this.bedCapacity.total - occupied;
};

// Static method to get all active departments
departmentSchema.statics.getActiveDepartments = function() {
  return this.find({ status: 'active' })
    .populate('headOfDepartment')
    .populate({
      path: 'headOfDepartment',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ displayOrder: 1, name: 1 });
};

// Static method to get featured departments
departmentSchema.statics.getFeaturedDepartments = function() {
  return this.find({ 
    status: 'active', 
    isFeatured: true 
  })
  .sort({ displayOrder: 1 })
  .limit(6);
};

// Static method to search departments
departmentSchema.statics.searchDepartments = function(searchTerm) {
  return this.find({
    status: 'active',
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { specializations: { $in: [new RegExp(searchTerm, 'i')] } },
      { commonConditions: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  })
  .sort({ name: 1 });
};

// Static method to get departments with available beds
departmentSchema.statics.getDepartmentsWithBeds = function() {
  return this.find({
    status: 'active',
    'bedCapacity.available': { $gt: 0 }
  })
  .sort({ 'bedCapacity.available': -1 });
};

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;