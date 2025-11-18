// frontend/src/utils/validators.js
import { REGEX_PATTERNS, ERROR_MESSAGES } from './constants';

/**
 * Required field validator
 */
export const required = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

/**
 * Email validator
 */
export const validateEmail = (email) => {
  if (!email) {
    return ERROR_MESSAGES.REQUIRED;
  }
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return '';
};

/**
 * Phone number validator
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return ERROR_MESSAGES.REQUIRED;
  }
  const cleanedPhone = phone.replace(/\s+/g, '');
  if (!REGEX_PATTERNS.PHONE.test(cleanedPhone)) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }
  return '';
};

/**
 * Aadhaar number validator
 */
export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) {
    return ERROR_MESSAGES.REQUIRED;
  }
  const cleanedAadhaar = aadhaar.replace(/\s+/g, '');
  if (!REGEX_PATTERNS.AADHAAR.test(cleanedAadhaar)) {
    return ERROR_MESSAGES.INVALID_AADHAAR;
  }
  return '';
};

/**
 * Password validator
 */
export const validatePassword = (password) => {
  if (!password) {
    return ERROR_MESSAGES.REQUIRED;
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  return '';
};

/**
 * Confirm password validator
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.REQUIRED;
  }
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_NOT_MATCH;
  }
  return '';
};

/**
 * Name validator
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim() === '') {
    return `${fieldName} is required`;
  }
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (name.length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return `${fieldName} should only contain letters and spaces`;
  }
  return '';
};

/**
 * Age validator
 */
export const validateAge = (age, min = 0, max = 150) => {
  if (!age && age !== 0) {
    return 'Age is required';
  }
  const numAge = parseInt(age);
  if (isNaN(numAge)) {
    return 'Age must be a number';
  }
  if (numAge < min || numAge > max) {
    return `Age must be between ${min} and ${max}`;
  }
  return '';
};

/**
 * Date validator
 */
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Invalid ${fieldName.toLowerCase()}`;
  }
  return '';
};

/**
 * Future date validator
 */
export const validateFutureDate = (date, fieldName = 'Date') => {
  const basicError = validateDate(date, fieldName);
  if (basicError) return basicError;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return `${fieldName} must be a future date`;
  }
  return '';
};

/**
 * Past date validator
 */
export const validatePastDate = (date, fieldName = 'Date') => {
  const basicError = validateDate(date, fieldName);
  if (basicError) return basicError;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (dateObj > today) {
    return `${fieldName} must be a past date`;
  }
  return '';
};

/**
 * Date of birth validator
 */
export const validateDateOfBirth = (dob) => {
  const basicError = validatePastDate(dob, 'Date of birth');
  if (basicError) return basicError;
  
  const dobObj = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dobObj.getFullYear();
  
  if (age > 150) {
    return 'Please enter a valid date of birth';
  }
  return '';
};

/**
 * Address validator
 */
export const validateAddress = (address) => {
  if (!address || address.trim() === '') {
    return 'Address is required';
  }
  if (address.length < 10) {
    return 'Address must be at least 10 characters long';
  }
  if (address.length > 200) {
    return 'Address must not exceed 200 characters';
  }
  return '';
};

/**
 * Pin code validator
 */
export const validatePinCode = (pinCode) => {
  if (!pinCode) {
    return 'Pin code is required';
  }
  if (!REGEX_PATTERNS.PIN_CODE.test(pinCode)) {
    return 'Please enter a valid 6-digit pin code';
  }
  return '';
};

/**
 * Number validator
 */
export const validateNumber = (value, fieldName = 'This field', min = null, max = null) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  if (min !== null && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== null && numValue > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return '';
};

/**
 * File validator
 */
export const validateFile = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  if (!file) {
    return 'Please select a file';
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  
  return '';
};

/**
 * URL validator
 */
export const validateURL = (url, fieldName = 'URL') => {
  if (!url) {
    return `${fieldName} is required`;
  }
  try {
    new URL(url);
    return '';
  } catch (error) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
};

/**
 * Array validator
 */
export const validateArray = (array, fieldName = 'This field', minLength = 1) => {
  if (!Array.isArray(array) || array.length < minLength) {
    return `${fieldName} must have at least ${minLength} item${minLength > 1 ? 's' : ''}`;
  }
  return '';
};

/**
 * Time validator
 */
export const validateTime = (time) => {
  if (!time) {
    return 'Time is required';
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return 'Please enter a valid time in HH:MM format';
  }
  return '';
};

/**
 * License number validator
 */
export const validateLicenseNumber = (license) => {
  if (!license || license.trim() === '') {
    return 'License number is required';
  }
  if (license.length < 5 || license.length > 20) {
    return 'License number must be between 5 and 20 characters';
  }
  return '';
};

/**
 * Qualification validator
 */
export const validateQualification = (qualification) => {
  if (!qualification || qualification.trim() === '') {
    return 'Qualification is required';
  }
  if (qualification.length < 2) {
    return 'Qualification must be at least 2 characters long';
  }
  return '';
};

/**
 * Experience validator
 */
export const validateExperience = (experience) => {
  const error = validateNumber(experience, 'Experience', 0, 70);
  if (error) return error;
  
  const exp = parseInt(experience);
  if (!Number.isInteger(exp)) {
    return 'Experience must be a whole number';
  }
  return '';
};

/**
 * Consultation fee validator
 */
export const validateConsultationFee = (fee) => {
  return validateNumber(fee, 'Consultation fee', 0, 50000);
};

/**
 * Blood group validator
 */
export const validateBloodGroup = (bloodGroup, bloodGroups) => {
  if (!bloodGroup) {
    return 'Blood group is required';
  }
  if (!bloodGroups.includes(bloodGroup)) {
    return 'Please select a valid blood group';
  }
  return '';
};

/**
 * Gender validator
 */
export const validateGender = (gender) => {
  if (!gender) {
    return 'Gender is required';
  }
  const validGenders = ['male', 'female', 'other'];
  if (!validGenders.includes(gender.toLowerCase())) {
    return 'Please select a valid gender';
  }
  return '';
};

/**
 * Specialization validator
 */
export const validateSpecialization = (specialization) => {
  if (!specialization || specialization.trim() === '') {
    return 'Specialization is required';
  }
  return '';
};

/**
 * Prescription validator
 */
export const validatePrescription = (data) => {
  const errors = {};

  // Validate diagnosis
  if (!data.diagnosis || data.diagnosis.trim() === '') {
    errors.diagnosis = 'Diagnosis is required';
  }

  // Validate medications
  if (!data.medications || data.medications.length === 0) {
    errors.medications = 'At least one medication is required';
  } else {
    data.medications.forEach((medication, index) => {
      if (!medication.name || medication.name.trim() === '') {
        errors[`medications.${index}.name`] = 'Medication name is required';
      }
      if (!medication.dosage || medication.dosage.trim() === '') {
        errors[`medications.${index}.dosage`] = 'Dosage is required';
      }
      if (!medication.frequency || medication.frequency.trim() === '') {
        errors[`medications.${index}.frequency`] = 'Frequency is required';
      }
      if (!medication.duration || medication.duration.trim() === '') {
        errors[`medications.${index}.duration`] = 'Duration is required';
      }
    });
  }

  // Validate follow-up date (optional but if provided, should be valid)
  if (data.followUpDate) {
    const dateError = validateFutureDate(data.followUpDate, 'Follow-up date');
    if (dateError) {
      errors.followUpDate = dateError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Form validator - validates multiple fields
 */
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = values[field];
    let error = '';
    
    // Run each validation rule
    for (const rule of rules) {
      error = rule(value, values);
      if (error) break;
    }
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  required,
  validateEmail,
  validatePhone,
  validateAadhaar,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateAge,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateDateOfBirth,
  validateAddress,
  validatePinCode,
  validateNumber,
  validateFile,
  validateURL,
  validateArray,
  validateTime,
  validateLicenseNumber,
  validateQualification,
  validateExperience,
  validateConsultationFee,
  validateBloodGroup,
  validateGender,
  validateSpecialization,
  validatePrescription,
  validateForm,
};