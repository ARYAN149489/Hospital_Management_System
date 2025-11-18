
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const Department = require('../models/Department.model');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@medicareplus.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = await User.create({
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@medicareplus.com',
    password: hashedPassword,
    phone: '8699095823',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'other',
    role: 'admin',
    isActive: true,
    isEmailVerified: true
    });

    // Create admin profile
    await Admin.create({
    user: adminUser._id,
    adminId: 'ADM000001',
    adminRole: 'super_admin',
    permissions: {
      canApproveDoctor: true,
      canManageUsers: true,
      canManageDepartments: true,
      canApproveLeaves: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canDeleteRecords: true,
      canManageAdmins: true
    }
  });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@medicareplus.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

// Seed departments
const seedDepartments = async () => {
  try {
    const existingDepartments = await Department.countDocuments();
    
    if (existingDepartments > 0) {
      console.log('⚠️  Departments already exist');
      return;
    }

    const departments = [
      {
        name: 'Cardiology',
        departmentCode: 'CARD-001',
        description: 'Heart and cardiovascular system care',
        isActive: true
      },
      {
        name: 'Neurology',
        departmentCode: 'NEUR-001',
        description: 'Nervous system disorders treatment',
        isActive: true
      },
      {
        name: 'Pediatrics',
        departmentCode: 'PEDI-001',
        description: 'Medical care for infants, children, and adolescents',
        isActive: true
      },
      {
        name: 'Orthopedics',
        departmentCode: 'ORTH-001',
        description: 'Musculoskeletal system care',
        isActive: true
      },
      {
        name: 'Dermatology',
        departmentCode: 'DERM-001',
        description: 'Skin, hair, and nail conditions treatment',
        isActive: true
      },
      {
        name: 'Oncology',
        departmentCode: 'ONCO-001',
        description: 'Cancer diagnosis and treatment',
        isActive: true
      },
      {
        name: 'General Medicine',
        departmentCode: 'GENM-001',
        description: 'General health care and consultation',
        isActive: true
      },
      {
        name: 'Emergency Medicine',
        departmentCode: 'EMER-001',
        description: '24/7 emergency care services',
        isActive: true
      }
    ];

    await Department.insertMany(departments);
    console.log('✅ Departments created successfully');

  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  }
};

// Main seed function
const seed = async () => {
  console.log('🌱 Starting database seeding...\n');
  
  await seedAdmin();
  await seedDepartments();
  
  console.log('\n✅ Database seeding completed!');
  console.log('\n📝 You can now:');
  console.log('   1. Start the backend: npm run dev');
  console.log('   2. Login with admin credentials');
  console.log('   3. Create doctor and patient accounts\n');
  
  process.exit(0);
};

// Run seed
seed();