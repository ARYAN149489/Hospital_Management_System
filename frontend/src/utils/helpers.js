// frontend/src/utils/helpers.js
import { format, parseISO, differenceInYears, isValid } from 'date-fns';

// ==================== DATE UTILITIES ====================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatStr) : '';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

/**
 * Format time only
 */
export const formatTime = (date) => {
  return formatDate(date, 'hh:mm a');
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  try {
    const parsedDate = typeof dob === 'string' ? parseISO(dob) : dob;
    return differenceInYears(new Date(), parsedDate);
  } catch (error) {
    console.error('Age calculation error:', error);
    return 0;
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - parsedDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(parsedDate);
  } catch (error) {
    console.error('Relative time error:', error);
    return '';
  }
};

// ==================== STRING UTILITIES ====================

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate string
 */
export const truncate = (str, length = 50) => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Format name
 */
export const formatName = (name) => {
  if (!name) return '';
  return name.split(' ').map(word => capitalize(word)).join(' ');
};

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone?.replace(/\s+/g, ''));
};

/**
 * Validate Aadhaar
 */
export const isValidAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar?.replace(/\s+/g, ''));
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, strength: 'none', message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, strength: 'weak', message: 'Password must be at least 8 characters' };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (criteriaCount < 3) {
    return { 
      isValid: false, 
      strength: 'medium', 
      message: 'Include uppercase, lowercase, number, and special character' 
    };
  }
  
  return { isValid: true, strength: 'strong', message: 'Strong password' };
};

// ==================== FORMATTING UTILITIES ====================

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ==================== STATUS UTILITIES ====================

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get priority badge color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// ==================== LOCAL STORAGE UTILITIES ====================

/**
 * Get item from localStorage
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage get error:', error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage set error:', error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Storage remove error:', error);
  }
};

// ==================== DEBOUNCE UTILITY ====================

/**
 * Debounce function calls
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ==================== ERROR HANDLING ====================

/**
 * Extract error message from error object
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};