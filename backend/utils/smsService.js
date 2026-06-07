// backend/utils/smsService.js

/**
 * SMS Service using Twilio
 * This is optional - configure only if you want SMS functionality
 */

let twilioClient = null;

/**
 * Initialize Twilio client
 */
const initializeTwilio = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Twilio credentials not found. SMS service will not be available.');
    return false;
  }
  
  try {
    const twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ SMS service (Twilio) initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Twilio:', error.message);
    return false;
  }
};

/**
 * Send SMS
 */
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    const initialized = initializeTwilio();
    if (!initialized) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }
  }
  
  try {
    // Format phone number (add +91 for India if not present)
    let phoneNumber = to.toString();
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+91${phoneNumber}`;
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('SMS sent:', result.sid);
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send OTP via SMS
 */
const sendOTP = async (phone, otp) => {
  const message = `Your OTP for MediCare Plus is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return await sendSMS(phone, message);
};

/**
 * Send appointment reminder SMS
 */
const sendAppointmentReminder = async (phone, doctorName, date, time) => {
  const message = `Reminder: You have an appointment with Dr. ${doctorName} on ${date} at ${time}. Please arrive 10 minutes early. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send appointment confirmation SMS
 */
const sendAppointmentConfirmation = async (phone, appointmentId, doctorName, date, time) => {
  const message = `Your appointment (ID: ${appointmentId}) with Dr. ${doctorName} is confirmed for ${date} at ${time}. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send appointment cancellation SMS
 */
const sendAppointmentCancellation = async (phone, appointmentId, reason = '') => {
  const message = `Your appointment (ID: ${appointmentId}) has been cancelled${reason ? `: ${reason}` : ''}. Please book a new appointment if needed. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send lab test booking confirmation SMS
 */
const sendLabTestConfirmation = async (phone, testName, date, time, labName) => {
  const message = `Your ${testName} test at ${labName} is scheduled for ${date} at ${time}. Please fast for 8-12 hours if required. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send lab test result ready SMS
 */
const sendLabTestResultReady = async (phone, testName) => {
  const message = `Your ${testName} test results are now available. Please login to view your results. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send prescription ready SMS
 */
const sendPrescriptionReady = async (phone, doctorName) => {
  const message = `Dr. ${doctorName} has added a new prescription for you. Login to view details. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send emergency alert SMS
 */
const sendEmergencyAlert = async (phone, patientName, message) => {
  const smsMessage = `EMERGENCY: ${patientName} needs immediate medical attention. ${message}. - MediCare Plus`;
  return await sendSMS(phone, smsMessage);
};

/**
 * Send password reset SMS
 */
const sendPasswordResetSMS = async (phone, resetCode) => {
  const message = `Your password reset code is: ${resetCode}. Valid for 10 minutes. If you didn't request this, please ignore. - MediCare Plus`;
  return await sendSMS(phone, message);
};

/**
 * Send account verification SMS
 */
const sendVerificationSMS = async (phone, verificationCode) => {
  const message = `Your verification code for MediCare Plus is: ${verificationCode}. Valid for 10 minutes.`;
  return await sendSMS(phone, message);
};

/**
 * Send bulk SMS (for announcements)
 */
const sendBulkSMS = async (phoneNumbers, message) => {
  const results = [];
  
  for (const phone of phoneNumbers) {
    const result = await sendSMS(phone, message);
    results.push({
      phone,
      ...result
    });
    
    // Add delay to avoid rate limiting (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

/**
 * Check SMS service availability
 */
const isAvailable = () => {
  return twilioClient !== null || 
         (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
};

/**
 * Get SMS delivery status
 */
const getMessageStatus = async (messageId) => {
  if (!twilioClient) {
    return {
      success: false,
      error: 'SMS service not configured'
    };
  }
  
  try {
    const message = await twilioClient.messages(messageId).fetch();
    
    return {
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Get message status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMS,
  sendOTP,
  sendAppointmentReminder,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendLabTestConfirmation,
  sendLabTestResultReady,
  sendPrescriptionReady,
  sendEmergencyAlert,
  sendPasswordResetSMS,
  sendVerificationSMS,
  sendBulkSMS,
  isAvailable,
  getMessageStatus
};