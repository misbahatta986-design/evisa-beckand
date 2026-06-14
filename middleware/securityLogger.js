const logger = require('../utils/logger');

// Security event logger
const logSecurityEvent = (eventType, details) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logSecurityEvent;
