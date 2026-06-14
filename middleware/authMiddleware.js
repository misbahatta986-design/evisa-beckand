const jwt = require('jsonwebtoken');
const logSecurityEvent = require('./securityLogger');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Log security event - missing token
    logSecurityEvent('MISSING_AUTH_TOKEN', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      requestId: req.id
    });

    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.',
      requestId: req.id
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Log security event - invalid token
    logSecurityEvent('INVALID_TOKEN', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      error: err.message,
      requestId: req.id
    });

    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.',
      requestId: req.id
    });
  }
};

module.exports = verifyToken;