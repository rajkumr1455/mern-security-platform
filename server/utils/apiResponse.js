const logger = require('./logger');

/**
 * Standardized API Response Utilities
 * Provides consistent response formats across the application
 */
class ApiResponse {
  /**
   * Success response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {Object} meta - Additional metadata
   */
  static success(data = null, message = 'Success', meta = {}) {
    return {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    }
  }

  /**
   * Error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {*} details - Error details
   * @param {number} statusCode - HTTP status code
   */
  static error(message = 'An error occurred', code = 'INTERNAL_ERROR', details = null, statusCode = 500) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      },
      statusCode
    }
  }

  /**
   * Validation error response
   * @param {Array} errors - Validation errors
   * @param {string} message - Error message
   */
  static validationError(errors = [], message = 'Validation failed') {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: errors,
        timestamp: new Date().toISOString()
      },
      statusCode: 400
    }
  }

  /**
   * Not found response
   * @param {string} resource - Resource name
   * @param {string} id - Resource ID
   */
  static notFound(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
        details: { resource, id },
        timestamp: new Date().toISOString()
      },
      statusCode: 404
    }
  }

  /**
   * Unauthorized response
   * @param {string} message - Error message
   */
  static unauthorized(message = 'Unauthorized access') {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
        details: null,
        timestamp: new Date().toISOString()
      },
      statusCode: 401
    }
  }

  /**
   * Forbidden response
   * @param {string} message - Error message
   */
  static forbidden(message = 'Access forbidden') {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
        details: null,
        timestamp: new Date().toISOString()
      },
      statusCode: 403
    }
  }

  /**
   * Paginated response
   * @param {Array} data - Response data
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(data = [], pagination = {}, message = 'Success') {
    const {
      page = 1,
      limit = 10,
      total = 0,
      totalPages = Math.ceil(total / limit)
    } = pagination;

    return {
      success: true,
      message,
      data,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          totalPages: parseInt(totalPages),
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Async operation response (for long-running tasks)
   * @param {string} taskId - Task identifier
   * @param {string} status - Task status
   * @param {*} data - Partial data if available
   * @param {string} message - Status message
   */
  static async(taskId, status = 'pending', data = null, message = 'Task initiated') {
    return {
      success: true,
      message,
      data: {
        taskId,
        status,
        result: data,
        timestamp: new Date().toISOString()
      }
    }
  }
}

/**
 * Express middleware for standardized responses
 */
const responseMiddleware = (req, res, next) => {
  // Add response methods to res object
  res.apiSuccess = (data, message, meta) => {
    const response = ApiResponse.success(data, message, meta);
    logger.info('API Success Response', { 
      endpoint: req.originalUrl, 
      method: req.method,
      statusCode: 200,
      message: response.message 
    });
    return res.status(200).json(response);
  }

  res.apiError = (message, code, details, statusCode = 500) => {
    const response = ApiResponse.error(message, code, details, statusCode);
    logger.error('API Error Response', { 
      endpoint: req.originalUrl, 
      method: req.method,
      statusCode: response.statusCode,
      error: response.error 
    });
    return res.status(response.statusCode).json(response);
  }

  res.apiValidationError = (errors, message) => {
    const response = ApiResponse.validationError(errors, message);
    logger.warn('API Validation Error', { 
      endpoint: req.originalUrl, 
      method: req.method,
      errors: response.error.details 
    });
    return res.status(response.statusCode).json(response);
  }

  res.apiNotFound = (resource, id) => {
    const response = ApiResponse.notFound(resource, id);
    logger.warn('API Not Found', { 
      endpoint: req.originalUrl, 
      method: req.method,
      resource,
      id 
    });
    return res.status(response.statusCode).json(response);
  }

  res.apiUnauthorized = (message) => {
    const response = ApiResponse.unauthorized(message);
    logger.warn('API Unauthorized', { 
      endpoint: req.originalUrl, 
      method: req.method,
      message: response.error.message 
    });
    return res.status(response.statusCode).json(response);
  }

  res.apiForbidden = (message) => {
    const response = ApiResponse.forbidden(message);
    logger.warn('API Forbidden', { 
      endpoint: req.originalUrl, 
      method: req.method,
      message: response.error.message 
    });
    return res.status(response.statusCode).json(response);
  }

  res.apiPaginated = (data, pagination, message) => {
    const response = ApiResponse.paginated(data, pagination, message);
    logger.info('API Paginated Response', { 
      endpoint: req.originalUrl, 
      method: req.method,
      pagination: response.meta.pagination 
    });
    return res.status(200).json(response);
  }

  res.apiAsync = (taskId, status, data, message) => {
    const response = ApiResponse.async(taskId, status, data, message);
    logger.info('API Async Response', { 
      endpoint: req.originalUrl, 
      method: req.method,
      taskId,
      status 
    });
    return res.status(202).json(response);
  }

  next();
}

/**
 * Error codes enum
 */
const ErrorCodes = {
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Business logic errors
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  OPERATION_FAILED: 'OPERATION_FAILED',
  INVALID_STATE: 'INVALID_STATE',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Security scanning errors
  SCAN_FAILED: 'SCAN_FAILED',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  TARGET_UNREACHABLE: 'TARGET_UNREACHABLE',
  INVALID_TARGET: 'INVALID_TARGET',
  
  // Web3 specific errors
  WEB3_CONNECTION_FAILED: 'WEB3_CONNECTION_FAILED',
  SMART_CONTRACT_ERROR: 'SMART_CONTRACT_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  
  // File/Upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED'
}

module.exports = {
  ApiResponse,
  responseMiddleware,
  ErrorCodes
}