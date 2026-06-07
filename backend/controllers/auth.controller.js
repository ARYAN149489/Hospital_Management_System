// backend/controllers/auth.controller.js
const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User.model');
const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const Admin = require('../models/Admin.model');
const { sendResponse } = require('../utils/responseHandler');

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  return sendResponse(res, 201, true, 'Registration successful', result);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return sendResponse(res, 200, true, 'Login successful', result);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.userId);
  return sendResponse(res, 200, true, 'Logged out successfully');
});

const getCurrentUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  let profile = null;
  if (user.role === 'patient') {
    profile = await Patient.findOne({ user: user._id });
  } else if (user.role === 'doctor') {
    profile = await Doctor.findOne({ user: user._id }).populate('department');
  } else if (user.role === 'admin') {
    profile = await Admin.findOne({ user: user._id });
  }

  return sendResponse(res, 200, true, 'User information retrieved', { user, profile });
});

const forgotPassword = catchAsync(async (req, res) => {
  const message = await authService.forgotPassword(req.body.email);
  return sendResponse(res, 200, true, message);
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  return sendResponse(res, 200, true, 'Password reset successful. You can now login with your new password.');
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.userId, currentPassword, newPassword);
  return sendResponse(res, 200, true, 'Password changed successfully');
});

const refreshToken = catchAsync(async (req, res) => {
  const tokens = await authService.refreshToken(req.body.refreshToken);
  return sendResponse(res, 200, true, 'Token refreshed successfully', tokens);
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.params.token);
  return sendResponse(res, 200, true, 'Email verified successfully');
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  verifyEmail
};