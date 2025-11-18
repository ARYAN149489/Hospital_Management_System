// frontend/src/utils/constants.js

// ==================== USER ROLES ====================
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

// ==================== APPOINTMENT STATUS ====================
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',  // Changed from PENDING to match backend
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',  // Added
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',  // Added
  RESCHEDULED: 'rescheduled',  // Added
  // Alias for backward compatibility
  PENDING: 'scheduled',
};

// ==================== LEAVE STATUS ====================
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ==================== LAB TEST STATUS ====================
export const LAB_TEST_STATUS = {
  PENDING: 'pending',
  SAMPLE_COLLECTED: 'sample-collected',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ==================== NOTIFICATION TYPES ====================
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  PRESCRIPTION: 'prescription',
  LAB_TEST: 'lab-test',
  LEAVE: 'leave',
  SYSTEM: 'system',
  REMINDER: 'reminder',
};

// ==================== BLOOD GROUPS ====================
export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

// ==================== GENDERS ====================
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// ==================== SPECIALIZATIONS ====================
export const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Gynecology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Radiology',
  'Pathology',
  'Anesthesiology',
  'Emergency Medicine',
  'Surgery',
  'Gastroenterology',
  'Endocrinology',
  'Nephrology',
  'Urology',
];

// ==================== DEPARTMENTS ====================
export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Gynecology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Radiology',
  'Pathology',
  'Emergency',
  'ICU',
  'Surgery',
  'General Medicine',
];

// ==================== APPOINTMENT TIME SLOTS ====================
export const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

// ==================== DAYS OF WEEK ====================
export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

// ==================== CONSULTATION FEES ====================
export const CONSULTATION_FEE_RANGE = {
  MIN: 200,
  MAX: 5000,
  DEFAULT: 500,
};

// ==================== FILE UPLOAD ====================
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
};

// ==================== PAGINATION ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50, 100],
};

// ==================== CHATBOT LANGUAGES ====================
export const CHATBOT_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

// ==================== DATE FORMATS ====================
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  TIME_ONLY: 'hh:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
};

// ==================== REGEX PATTERNS ====================
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  AADHAAR: /^\d{12}$/,
  PIN_CODE: /^\d{6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_AADHAAR: 'Please enter a valid 12-digit Aadhaar number',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please check your internet connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'Unauthorized. Please login again',
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  LEAVE_APPLIED: 'Leave application submitted successfully',
  PRESCRIPTION_CREATED: 'Prescription created successfully',
};

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  PATIENTS: {
    BASE: '/patients',
    PROFILE: '/patients/profile',
    APPOINTMENTS: '/patients/appointments',
  },
  DOCTORS: {
    BASE: '/doctors',
    PROFILE: '/doctors/profile',
    APPOINTMENTS: '/doctors/appointments',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    AVAILABLE_SLOTS: '/appointments/available-slots',
  },
};

// ==================== THEME COLORS ====================
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#8B5CF6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
};

// ==================== CHART COLORS ====================
export const CHART_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
];

export default {
  USER_ROLES,
  APPOINTMENT_STATUS,
  LEAVE_STATUS,
  LAB_TEST_STATUS,
  NOTIFICATION_TYPES,
  BLOOD_GROUPS,
  GENDERS,
  SPECIALIZATIONS,
  DEPARTMENTS,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  CONSULTATION_FEE_RANGE,
  FILE_UPLOAD,
  PAGINATION,
  CHATBOT_LANGUAGES,
  DATE_FORMATS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  THEME_COLORS,
  CHART_COLORS,
};