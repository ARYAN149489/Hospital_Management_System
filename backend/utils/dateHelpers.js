// backend/utils/dateHelpers.js

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @param {string} format - Format type (short, long, time, datetime)
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  };
  
  return d.toLocaleString('en-US', options[format] || options.short);
};

/**
 * Get day name from date
 */
const getDayName = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date(date).getDay()];
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Add days to a date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 */
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Add years to a date
 */
const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Get start of day
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week (Monday)
 */
const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of week (Sunday)
 */
const endOfWeek = (date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of month
 */
const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of month
 */
const endOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if date is today
 */
const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  
  return today.toDateString() === d.toDateString();
};

/**
 * Check if date is tomorrow
 */
const isTomorrow = (date) => {
  const tomorrow = addDays(new Date(), 1);
  const d = new Date(date);
  
  return tomorrow.toDateString() === d.toDateString();
};

/**
 * Check if date is in the past
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Check if date is within range
 */
const isWithinRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return d >= start && d <= end;
};

/**
 * Get difference in days between two dates
 */
const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get difference in hours between two dates
 */
const getHoursDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60));
};

/**
 * Get difference in minutes between two dates
 */
const getMinutesDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60));
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Get time until date (e.g., "in 2 hours")
 */
const getTimeUntil = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d - now;
  
  if (diffMs < 0) {
    return 'passed';
  }
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'in a few seconds';
  } else if (diffMins < 60) {
    return `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `in ${months} month${months > 1 ? 's' : ''}`;
  }
};

/**
 * Format time from minutes (e.g., 90 -> "1h 30m")
 */
const formatMinutes = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Get date range for a period
 */
const getDateRange = (period) => {
  const now = new Date();
  let start, end;
  
  switch (period) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'yesterday':
      start = startOfDay(addDays(now, -1));
      end = endOfDay(addDays(now, -1));
      break;
    case 'this_week':
      start = startOfWeek(now);
      end = endOfWeek(now);
      break;
    case 'last_week':
      start = startOfWeek(addDays(now, -7));
      end = endOfWeek(addDays(now, -7));
      break;
    case 'this_month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'last_month':
      start = startOfMonth(addMonths(now, -1));
      end = endOfMonth(addMonths(now, -1));
      break;
    case 'last_7_days':
      start = startOfDay(addDays(now, -7));
      end = endOfDay(now);
      break;
    case 'last_30_days':
      start = startOfDay(addDays(now, -30));
      end = endOfDay(now);
      break;
    default:
      start = startOfDay(now);
      end = endOfDay(now);
  }
  
  return { start, end };
};

/**
 * Check if time is within working hours (9 AM - 6 PM)
 */
const isWorkingHours = (time) => {
  const [hours] = time.split(':').map(Number);
  return hours >= 9 && hours < 18;
};

/**
 * Get current timestamp in ISO format
 */
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Convert date to ISO string
 */
const toISOString = (date) => {
  return new Date(date).toISOString();
};

module.exports = {
  formatDate,
  getDayName,
  calculateAge,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  isWithinRange,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  getRelativeTime,
  getTimeUntil,
  formatMinutes,
  getDateRange,
  isWorkingHours,
  getCurrentTimestamp,
  toISOString
};