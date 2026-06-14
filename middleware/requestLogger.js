const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Request logging middleware
const requestLogger = (req, res, next) => {
  // Generate request ID
  req.id = uuidv4();
  const startTime = Date.now();

  // Log incoming request
  logger.info({
    type: 'REQUEST',
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info({
      type: 'RESPONSE',
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    // Warn if response is slow (> 1 second)
    if (duration > 1000) {
      logger.warn({
        type: 'SLOW_RESPONSE',
        requestId: req.id,
        path: req.path,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;
