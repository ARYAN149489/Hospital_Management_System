// backend/middleware/errorHandler.middleware.js

/**
 * Custom Error Class
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode: error.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = new ErrorResponse(message, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please login again.';
    error = new ErrorResponse(message, 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please login again.';
    error = new ErrorResponse(message, 401);
  }
  
  // Multer errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
    
    error = new ErrorResponse(message, 400);
  }
  
  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack
    })
  });
};

/**
 * Handle 404 - Not Found
 */
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Async Handler - Wrapper to catch async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation Error Handler
 */
const validationErrorHandler = (errors) => {
  const message = errors.map(err => err.msg).join(', ');
  return new ErrorResponse(message, 400);
};

/**
 * Database Error Handler
 */
const handleDatabaseError = (error) => {
  if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new ErrorResponse(`Duplicate field value: ${field}`, 400);
    }
  }
  
  return new ErrorResponse('Database error occurred', 500);
};

/**
 * Send Error Response (utility function)
 */
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message: message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Send Success Response (utility function)
 */
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message: message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Handle Async Errors in Routes
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Operational Error vs Programming Error
 */
const isOperationalError = (error) => {
  if (error instanceof ErrorResponse) {
    return error.isOperational;
  }
  return false;
};

/**
 * Error Logger
 */
const logError = (error) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, you might want to send errors to a logging service
    // like Sentry, LogRocket, or CloudWatch
    console.error('Production Error:', {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Development Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Critical Error Handler (for unhandled rejections)
 */
const handleCriticalError = (error) => {
  logError(error);
  
  if (!isOperationalError(error)) {
    // Programming error - exit process
    console.error('CRITICAL ERROR - SHUTTING DOWN');
    process.exit(1);
  }
};

/**
 * Rate Limit Error Handler
 */
const handleRateLimitError = (req, res) => {
  return res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.'
  });
};

/**
 * CORS Error Handler
 */
const handleCorsError = (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'CORS policy violation'
  });
};

/**
 * Sanitize Error (remove sensitive info before sending to client)
 */
const sanitizeError = (error) => {
  const sanitized = {
    message: error.message,
    statusCode: error.statusCode || 500
  };
  
  // Don't expose stack traces in production
  if (process.env.NODE_ENV === 'development') {
    sanitized.stack = error.stack;
  }
  
  return sanitized;
};

module.exports = {
  ErrorResponse,
  errorHandler,
  notFound,
  asyncHandler,
  validationErrorHandler,
  handleDatabaseError,
  sendErrorResponse,
  sendSuccessResponse,
  catchAsync,
  isOperationalError,
  logError,
  handleCriticalError,
  handleRateLimitError,
  handleCorsError,
  sanitizeError
};