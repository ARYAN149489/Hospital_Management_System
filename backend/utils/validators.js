// backend/utils/validators.js

/**
 * Validate Indian phone number
 */
const isValidIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 6 characters, 1 uppercase, 1 lowercase, 1 number
 */
const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate date of birth (not in future, not too old)
 */
const isValidDateOfBirth = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
  
  return age >= 0 && age <= 150;
};

/**
 * Validate Indian pincode
 */
const isValidIndianPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate time format (HH:MM)
 */
const isValidTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validate date is not in the past
 */
const isNotPastDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

/**
 * Validate date is within range
 */
const isDateInRange = (date, minDays = 0, maxDays = 90) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);
  
  return inputDate >= minDate && inputDate <= maxDate;
};

/**
 * Validate medical license number format
 */
const isValidMedicalLicense = (licenseNumber) => {
  // Indian medical license format varies by state
  // This is a basic validation - adjust as needed
  const licenseRegex = /^[A-Z]{2,5}[0-9]{4,10}$/;
  return licenseRegex.test(licenseNumber);
};

/**
 * Validate Aadhaar number (Indian ID)
 */
const isValidAadhaar = (aadhaar) => {
  const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};

/**
 * Validate PAN card number (Indian tax ID)
 */
const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

/**
 * Validate blood group
 */
const isValidBloodGroup = (bloodGroup) => {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bloodGroup);
};

/**
 * Validate consultation fee range
 */
const isValidConsultationFee = (fee) => {
  return fee >= 0 && fee <= 10000;
};

/**
 * Validate years of experience
 */
const isValidExperience = (years) => {
  return years >= 0 && years <= 70;
};

/**
 * Sanitize string (remove HTML tags)
 */
const sanitizeString = (str) => {
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Validate file extension
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(`.${ext}`);
};

/**
 * Validate file size (in bytes)
 */
const isValidFileSize = (size, maxSizeInMB = 10) => {
  const maxSize = maxSizeInMB * 1024 * 1024;
  return size <= maxSize;
};

/**
 * Validate URL format
 */
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate appointment time slot (must be on the hour or half hour)
 */
const isValidAppointmentTime = (time) => {
  if (!isValidTime(time)) return false;
  
  const [hours, minutes] = time.split(':');
  return minutes === '00' || minutes === '30';
};

/**
 * Check if date is a working day (Monday-Saturday)
 */
const isWorkingDay = (date) => {
  const day = new Date(date).getDay();
  return day >= 1 && day <= 6; // Monday = 1, Saturday = 6
};

/**
 * Validate age range
 */
const isAgeInRange = (dateOfBirth, minAge = 0, maxAge = 150) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
  
  return age >= minAge && age <= maxAge;
};

/**
 * Validate prescription duration
 */
const isValidDuration = (duration) => {
  const { value, unit } = duration;
  
  if (!value || !unit) return false;
  if (value <= 0) return false;
  if (!['days', 'weeks', 'months'].includes(unit)) return false;
  
  // Convert to days for maximum check
  let days = value;
  if (unit === 'weeks') days = value * 7;
  if (unit === 'months') days = value * 30;
  
  return days <= 365; // Max 1 year
};

/**
 * Validate Indian state name
 */
const isValidIndianState = (state) => {
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  return states.includes(state);
};

/**
 * Clean and format phone number
 */
const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '').slice(-10);
};

/**
 * Clean and format pincode
 */
const formatPincode = (pincode) => {
  return pincode.replace(/\D/g, '');
};

/**
 * Validate rating (1-5)
 */
const isValidRating = (rating) => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

module.exports = {
  isValidIndianPhone,
  isValidEmail,
  isStrongPassword,
  isValidDateOfBirth,
  isValidIndianPincode,
  isValidTime,
  isNotPastDate,
  isDateInRange,
  isValidMedicalLicense,
  isValidAadhaar,
  isValidPAN,
  isValidBloodGroup,
  isValidConsultationFee,
  isValidExperience,
  sanitizeString,
  isValidFileExtension,
  isValidFileSize,
  isValidURL,
  isValidObjectId,
  isValidAppointmentTime,
  isWorkingDay,
  isAgeInRange,
  isValidDuration,
  isValidIndianState,
  formatPhoneNumber,
  formatPincode,
  isValidRating
};