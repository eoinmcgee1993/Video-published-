/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
