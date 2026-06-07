// backend/services/auth.service.js
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Admin = require('../models/Admin.model');
const AppError = require('../utils/appError');
const { generateTokens } = require('../utils/jwt');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

class AuthService {
  async register(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      role,
      address,
      specialization,
      department,
      qualifications,
      medicalLicenseNumber,
      medicalCouncilRegistration,
      licenseValidUntil,
      yearsOfExperience,
      consultationFee,
      languages,
      emergencyContact
    } = userData;

    // Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Check phone uniqueness
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw new AppError('User with this phone number already exists', 400);
    }

    // Create Base User
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      role,
      address
    });

    // Create role-specific profiles
    if (role === 'patient') {
      await Patient.create({
        user: user._id,
        emergencyContact: emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        }
      });
    } else if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General Practitioner',
        department: department,
        qualifications: qualifications || [],
        medicalLicenseNumber,
        medicalCouncilRegistration,
        licenseValidUntil,
        yearsOfExperience: yearsOfExperience || 0,
        consultationFee: consultationFee || 500,
        languages: languages || ['english'],
        approvalStatus: 'pending'
      });
    }

    // Generate credentials tokens
    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Trigger welcome emails asynchronously
    emailService.sendWelcomeEmail(user).catch(err => {
      console.error('⚠️ Welcome email notification failure:', err.message);
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      ...tokens
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact Admin for further information.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor && doctor.isBlocked) {
        throw new AppError('Your account has been temporarily blocked. Please contact the administrator.', 403);
      }
    }

    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      ...tokens
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 }
    });
    return true;
  }

  async refreshToken(token) {
    const { verifyToken } = require('../utils/jwt');
    let decoded;
    try {
      decoded = verifyToken(token, true);
    } catch (err) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return 'If an account exists with this email, a password reset link has been sent.';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiration
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new AppError('Failed to send password reset email. Please try again.', 500);
    }

    return 'Password reset link has been sent to your email.';
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    return true;
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
