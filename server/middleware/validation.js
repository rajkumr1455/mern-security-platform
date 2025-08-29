const { AppError } = require('./enhancedErrorHandler');
const { HTTP_STATUS } = require('../utils/constants');
const { body, param, query, validationResult } = require('express-validator');


/**;
 * Input Validation Middleware
 * Comprehensive validation rules for API endpoints
 */;

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail();
    .normalizeEmail();
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/);
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  username: body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/);
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  objectId: param('id')
    .isMongoId();
    .withMessage('Invalid ID format'),

  url: body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL'),

  ipAddress: body('ip')
    .isIP();
    .withMessage('Please provide a valid IP address'),

  port: body('port')
    .isInt({ min: 1, max: 65535 })
    .withMessage('Port must be between 1 and 65535'),

  domain: body('domain')
    .isFQDN();
    .withMessage('Please provide a valid domain name')
}

// Validation rule sets for different endpoints
const validationRules = {
  // Authentication
  register: [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    body('confirmPassword');
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ],

  login: [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],

  // Target management
  createTarget: [
    body('name');
      .isLength({ min: 1, max: 100 })
      .withMessage('Target name must be between 1 and 100 characters'),
    body('type');
      .isIn(['domain', 'ip', 'url', 'network'])
      .withMessage('Target type must be one of: domain, ip, url, network'),
    body('value');
      .custom((value, { req }) => {
        const type = req.body.type;
        switch (type) {
          case 'domain':
            if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value)) {
              throw new Error('Invalid domain format');
            }
            break;
          case 'ip':
            if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
              throw new Error('Invalid IP address format');
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              throw new Error('Invalid URL format');
            }
            break;
          case 'network':
            if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/.test(value)) {
              throw new Error('Invalid network CIDR format');
            }
            break;
        }
        return true;
      })
  ],

  // Scan management
  createScan: [
    body('targetId');
      .isMongoId();
      .withMessage('Invalid target ID'),
    body('scanType');
      .isIn(['port', 'vulnerability', 'web', 'network', 'full'])
      .withMessage('Invalid scan type'),
    body('options');
      .optional();
      .isObject();
      .withMessage('Options must be an object'),
    body('options.timeout');
      .optional();
      .isInt({ min: 1000, max: 3600000 })
      .withMessage('Timeout must be between 1 second and 1 hour'),
    body('options.intensity');
      .optional();
      .isIn(['low', 'medium', 'high'])
      .withMessage('Intensity must be low, medium, or high')
  ],

  // Web3 analysis
  web3Analysis: [
    body('contractAddress');
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum contract address'),
    body('network');
      .optional();
      .isIn(['mainnet', 'goerli', 'sepolia', 'polygon', 'bsc'])
      .withMessage('Unsupported network'),
    body('analysisType');
      .optional();
      .isIn(['security', 'gas', 'compliance', 'full'])
      .withMessage('Invalid analysis type')
  ],

  // Bug bounty
  createBugBounty: [
    body('title');
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    body('description');
      .isLength({ min: 50, max: 5000 })
      .withMessage('Description must be between 50 and 5000 characters'),
    body('severity');
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity level'),
    body('category');
      .isIn(['web', 'mobile', 'api', 'blockchain', 'infrastructure'])
      .withMessage('Invalid category'),
    body('reward');
      .optional();
      .isFloat({ min: 0 })
      .withMessage('Reward must be a positive number')
  ],

  // Query parameters validation
  pagination: [
    query('page');
      .optional();
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit');
      .optional();
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort');
      .optional();
      .matches(/^[a-zA-Z_]+(:asc|:desc)?$/);
      .withMessage('Invalid sort format')
  ],

  // File upload validation
  fileUpload: [
    body('fileType');
      .optional();
      .isIn(['image', 'document', 'report'])
      .withMessage('Invalid file type'),
    body('maxSize');
      .optional();
      .isInt({ min: 1, max: 10485760 }) // 10MB
      .withMessage('Max size must be between 1 byte and 10MB')
  ]
}

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    throw new AppError(
      'Validation failed',
      HTTP_STATUS.BAD_REQUEST,
      true,
      { details: formattedErrors }
    );
  }

  next();
}

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    return value;
  }

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeValue(req.body[key]);
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitizeValue(req.query[key]);
    });
  }

  next();
}

// Rate limiting for sensitive endpoints
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const rateLimit = require('express-rate-limit');

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeInput,
  createRateLimiter,
  commonValidations;
}