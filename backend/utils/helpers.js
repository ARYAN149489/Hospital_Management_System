// backend/utils/helpers.js

/**
 * Generate unique lab test ID
 * Format: LT-YYYYMMDD-XXXXX
 */
exports.generateLabTestId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  
  return `LT-${year}${month}${day}-${random}`;
};

/**
 * Format date to readable string
 */
exports.formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format currency
 */
exports.formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

module.exports = exports;
