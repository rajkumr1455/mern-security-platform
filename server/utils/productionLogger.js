const path = require('path');
const winston = require('winston');


// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure Winston logger
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-platform' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Production-safe console replacement
const productionLogger = {
  error: (message, meta = {}) => {
    winstonLogger.error(message, meta);
  },

  warn: (message, meta = {}) => {
    winstonLogger.warn(message, meta);
  },

  info: (message, meta = {}) => {
    winstonLogger.info(message, meta);
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      winstonLogger.debug(message, meta);
    }
  },

  // For replacing console.log in production
  log: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'production') {
      winstonLogger.info(message, meta);
    } else {
      winstonLogger.info(message, meta);
    }
  }
}

module.exports = productionLogger;