// backend/utils/errorResponse.js

/**
 * Custom Error Response Class
 * Extends the built-in Error class to include status codes
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Pre-defined error creators for common scenarios
 */

/**
 * 400 Bad Request
 */
const BadRequestError = (message = 'Bad Request') => {
  return new ErrorResponse(message, 400);
};

/**
 * 401 Unauthorized
 */
const UnauthorizedError = (message = 'Unauthorized') => {
  return new ErrorResponse(message, 401);
};

/**
 * 403 Forbidden
 */
const ForbiddenError = (message = 'Access Forbidden') => {
  return new ErrorResponse(message, 403);
};

/**
 * 404 Not Found
 */
const NotFoundError = (message = 'Resource Not Found') => {
  return new ErrorResponse(message, 404);
};

/**
 * 409 Conflict
 */
const ConflictError = (message = 'Resource Conflict') => {
  return new ErrorResponse(message, 409);
};

/**
 * 422 Unprocessable Entity
 */
const ValidationError = (message = 'Validation Failed') => {
  return new ErrorResponse(message, 422);
};

/**
 * 429 Too Many Requests
 */
const RateLimitError = (message = 'Too Many Requests') => {
  return new ErrorResponse(message, 429);
};

/**
 * 500 Internal Server Error
 */
const InternalServerError = (message = 'Internal Server Error') => {
  return new ErrorResponse(message, 500);
};

/**
 * 503 Service Unavailable
 */
const ServiceUnavailableError = (message = 'Service Unavailable') => {
  return new ErrorResponse(message, 503);
};

/**
 * Success Response Helper
 */
class SuccessResponse {
  constructor(message, data = null, statusCode = 200) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode;
    
    if (data !== null) {
      this.data = data;
    }
  }
  
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      ...(this.data && { data: this.data })
    });
  }
}

/**
 * Paginated Response Helper
 */
class PaginatedResponse extends SuccessResponse {
  constructor(message, data, pagination) {
    super(message, data, 200);
    this.pagination = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    };
  }
  
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      pagination: this.pagination
    });
  }
}

/**
 * Error Handler Utilities
 */

/**
 * Check if error is operational (expected) or programming error
 */
const isOperationalError = (error) => {
  if (error instanceof ErrorResponse) {
    return error.isOperational;
  }
  return false;
};

/**
 * Format validation errors from express-validator
 */
const formatValidationErrors = (errors) => {
  return errors.map(err => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value
  }));
};

/**
 * Handle Mongoose CastError (Invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ErrorResponse(message, 400);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new ErrorResponse(message, 400);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => e.message);
  const message = errors.join(', ');
  return new ErrorResponse(message, 400);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
  return new ErrorResponse('Invalid token. Please login again.', 401);
};

const handleJWTExpiredError = () => {
  return new ErrorResponse('Token expired. Please login again.', 401);
};

/**
 * Create error from Mongoose error
 */
const createMongooseError = (err) => {
  if (err.name === 'CastError') {
    return handleCastError(err);
  }
  
  if (err.code === 11000) {
    return handleDuplicateKeyError(err);
  }
  
  if (err.name === 'ValidationError') {
    return handleValidationError(err);
  }
  
  return new ErrorResponse(err.message, 500);
};

/**
 * Send error response
 */
const sendErrorResponse = (err, req, res) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Mongoose errors
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }
  
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

module.exports = {
  ErrorResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  SuccessResponse,
  PaginatedResponse,
  isOperationalError,
  formatValidationErrors,
  createMongooseError,
  sendErrorResponse,
  handleCastError,
  handleDuplicateKeyError,
  handleValidationError,
  handleJWTError,
  handleJWTExpiredError
};