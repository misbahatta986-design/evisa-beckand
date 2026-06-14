const logger = require('../utils/logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || 'unknown';

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp
  });

  // Default error response
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(status).json({
    success: false,
    message,
    requestId,
    timestamp
  });
};

module.exports = errorHandler;
