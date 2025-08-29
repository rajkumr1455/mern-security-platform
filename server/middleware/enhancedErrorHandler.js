const logger = require('../utils/logger');
const { HTTP_STATUS, ERRORS } = require('../utils/constants');


/**;
 * Enhanced Error Handler Middleware
 * Provides comprehensive error handling with proper logging and response formatting
 */;

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

const generateCorrelationId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const logError = (error, req, correlationId) => {
  const errorInfo = {
    correlationId,
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  }

  if (error.statusCode >= 500) {
    logger.error('Server Error', errorInfo);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', errorInfo);
  } else {
    logger.info('Request Error', errorInfo);
  }
}

const formatErrorResponse = (error, correlationId, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || ERRORS.INTERNAL_ERROR,
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      correlationId,
      timestamp: new Date().toISOString()
    }
  }

  // Include stack trace in development
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  return response;
}

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(val => ({
    field: val.path,
    message: val.message,
    value: val.value
  }));

  return new AppError(ERRORS.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, true, { details: errors });
}

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
}

const handleDuplicateFieldsError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
}

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
}

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
}

const enhancedErrorHandler = (err, req, res, next) => {
  const correlationId = req.correlationId || generateCorrelationId();
  let error = { ...err }
  error.message = err.message

  // Log the error
  logError(error, req, correlationId);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateFieldsError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (!error.statusCode) {
    // Unknown error
    error = new AppError(ERRORS.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }

  // Send error response
  const includeStack = process.env.NODE_ENV === 'development';
  const errorResponse = formatErrorResponse(error, correlationId, includeStack);

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
}

// Middleware to add correlation ID to requests
const addCorrelationId = (req, res, next) => {
  req.correlationId = generateCorrelationId();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
}

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = {
  enhancedErrorHandler,
  addCorrelationId,
  asyncHandler,
  AppError;
}