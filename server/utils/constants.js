/**;
 * Application Constants
 * Centralized configuration values and magic numbers
 */;

module.exports = {
  // Authentication
  AUTH: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    JWT_EXPIRE_TIME: '7d',
    BCRYPT_ROUNDS: 12
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    SKIP_SUCCESSFUL_REQUESTS: false
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
    UPLOAD_PATH: 'uploads/'
  },

  // Database
  DB: {
    CONNECTION_TIMEOUT: 30000,
    MAX_POOL_SIZE: 10,
    MIN_POOL_SIZE: 2
  },

  // Security Scanning
  SCAN: {
    MAX_CONCURRENT_SCANS: 5,
    DEFAULT_TIMEOUT: 300000, // 5 minutes
    MAX_TARGETS_PER_SCAN: 100
  },

  // Web3 Analysis
  WEB3: {
    DEFAULT_GAS_LIMIT: 21000,
    MAX_BLOCK_RANGE: 1000,
    SUPPORTED_NETWORKS: ['mainnet', 'goerli', 'sepolia', 'polygon', 'bsc']
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Error Messages
  ERRORS: {
    VALIDATION_ERROR: 'Validation failed',
    AUTHENTICATION_FAILED: 'Authentication failed',
    AUTHORIZATION_FAILED: 'Insufficient permissions',
    RESOURCE_NOT_FOUND: 'Resource not found',
    DUPLICATE_RESOURCE: 'Resource already exists',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error'
  },

  // Success Messages
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    OPERATION_COMPLETED: 'Operation completed successfully'
  }
}