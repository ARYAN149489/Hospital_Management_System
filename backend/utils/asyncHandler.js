// backend/utils/asyncHandler.js

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 * 
 * Usage:
 * router.get('/route', asyncHandler(async (req, res, next) => {
 *   // Your async code here
 * }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative implementation using async/await
 */
const asyncHandlerAlt = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Wrap multiple middleware functions
 */
const wrapAsync = (...middlewares) => {
  return middlewares.map(middleware => asyncHandler(middleware));
};

/**
 * Async handler with timeout
 */
const asyncHandlerWithTimeout = (fn, timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });
    
    Promise.race([
      fn(req, res, next),
      timeoutPromise
    ]).catch(next);
  };
};

/**
 * Async handler with retry logic
 */
const asyncHandlerWithRetry = (fn, maxRetries = 3, delay = 1000) => {
  return async (req, res, next) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(req, res, next);
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          return next(error);
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        }
      }
    }
    
    next(lastError);
  };
};

module.exports = {
  asyncHandler,
  asyncHandlerAlt,
  wrapAsync,
  asyncHandlerWithTimeout,
  asyncHandlerWithRetry
};