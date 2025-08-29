/**;
 * Production-safe logging utility
 * Replaces console.log statements with proper logging
 */;

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG
    this.enableRemoteLogging = process.env.NODE_ENV === 'production';
  }

  error(message, data = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      // logger.error(`[ERROR] ${message}`, data); // TODO: Implement client-side logging

      if (this.enableRemoteLogging) {
        this.sendToRemote('error', message, data);
      }
    }
  }

  warn(message, data = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      // logger.warn(`[WARN] ${message}`, data); // TODO: Implement client-side logging

      if (this.enableRemoteLogging) {
        this.sendToRemote('warn', message, data);
      }
    }
  }

  info(message, data = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      if (process.env.NODE_ENV === 'development') {
        console.info(`[INFO] ${message}`, data);
      }
    }
  }

  debug(message, data = {}) {
    if (this.level >= LOG_LEVELS.DEBUG && process.env.NODE_ENV === 'development') {
      // logger.info(`[DEBUG] ${message}`, data); // TODO: Implement client-side logging
    }
  }

  sendToRemote(level, message, data) {
    // Send logs to remote service in production
    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail if logging service is unavailable
      });
    } catch (e) {
      // Silently fail
    }
  }

  // Performance logging
  time(label) {
    if (process.env.NODE_ENV === 'development') {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label);
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;