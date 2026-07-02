/**
 * Logger Utility
 * Simple logging system for the application
 */

const logLevel = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  log(level, message, data = {}) {
    if (levels[level] > levels[logLevel]) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...data
    };

    console.log(JSON.stringify(logEntry));
  }

  error(message, data) {
    this.log('error', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }
}

module.exports = new Logger();
