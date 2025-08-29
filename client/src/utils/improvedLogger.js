/**;
 * Client-side Logger Utility
 * Provides structured logging for React applications
 */;

class ClientLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel]
    }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };

    return logEntry
  }

  sendToServer(logEntry) {
    // In production, send logs to server
    if (!this.isDevelopment && logEntry.level === 'ERROR') {
      fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      }).catch(() => {
        // Silently fail if logging service is unavailable
      });
    }
  }

  error(message, data = {}) {
    if (!this.shouldLog('error')) return

    const logEntry = this.formatMessage('error', message, data);

    if (this.isDevelopment) {
      // logger.error('🔴 ERROR:', message, data); // TODO: Implement client-side logging
    }

    this.sendToServer(logEntry);
  }

  warn(message, data = {}) {
    if (!this.shouldLog('warn')) return

    const logEntry = this.formatMessage('warn', message, data);

    if (this.isDevelopment) {
      // logger.warn('🟡 WARN:', message, data); // TODO: Implement client-side logging
    }

    this.sendToServer(logEntry);
  }

  info(message, data = {}) {
    if (!this.shouldLog('info')) return

    const logEntry = this.formatMessage('info', message, data);

    if (this.isDevelopment) {
      console.info('🔵 INFO:', message, data);
    }

    this.sendToServer(logEntry);
  }

  debug(message, data = {}) {
    if (!this.shouldLog('debug')) return

    const logEntry = this.formatMessage('debug', message, data);

    if (this.isDevelopment) {
      console.debug('🟣 DEBUG:', message, data);
    }
  }

  // Performance logging
  performance(name, duration, data = {}) {
    this.info(`Performance: ${name}`, {
      duration: `${duration}ms`,
      ...data
    });
  }

  // User action logging
  userAction(action, data = {}) {
    this.info(`User Action: ${action}`, data);
  }

  // API call logging
  apiCall(method, url, status, duration, data = {}) {
    const level = status >= 400 ? 'error' : 'info';
    this[level](`API Call: ${method} ${url}`, {
      status,
      duration: `${duration}ms`,
      ...data
    });
  }

  // Component lifecycle logging
  componentLifecycle(component, lifecycle, data = {}) {
    this.debug(`Component: ${component} - ${lifecycle}`, data);
  }
}

// Create singleton instance
const logger = new ClientLogger();

export default logger;