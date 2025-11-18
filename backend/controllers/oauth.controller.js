// backend/controllers/oauth.controller.js
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const { generateTokens } = require('../utils/jwt');
const axios = require('axios');
const crypto = require('crypto');

/**
 * @desc    Google OAuth Login
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    const { email, given_name, family_name, picture, email_verified } = response.data;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified with Google'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - login
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicture: user.profilePicture
          }
        }
      });
    } else {
      // User doesn't exist - create new patient account
      user = await User.create({
        email,
        firstName: given_name || 'User',
        lastName: family_name || '',
        password: crypto.randomBytes(32).toString('hex'), // Random password
        role: 'patient',
        profilePicture: picture,
        isEmailVerified: true,
        phone: `GOOGLE_${Date.now()}` // Temporary phone number
      });

      // Create patient profile
      await Patient.create({
        user: user._id,
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicture: user.profilePicture
          },
          requiresPhoneUpdate: true // Flag to update phone later
        }
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.error_description || 'Google authentication failed',
      error: error.message
    });
  }
};

module.exports = exports;
