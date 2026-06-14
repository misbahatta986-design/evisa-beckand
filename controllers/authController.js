const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const logSecurityEvent = require('../middleware/securityLogger');
const logger = require('../utils/logger');

// Register
const register = (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn({
      type: 'VALIDATION_ERROR',
      endpoint: '/api/auth/register',
      errors: errors.array(),
      ip: req.ip,
      requestId: req.id
    });
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      requestId: req.id
    });
  }

  const { full_name, email, password } = req.body;

  const checkEmail = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmail, [email], (err, result) => {
    if (err) {
      logger.error({
        type: 'DB_ERROR',
        endpoint: '/api/auth/register',
        error: err.message,
        requestId: req.id
      });
      return res.status(500).json({ 
        success: false,
        message: 'Server error',
        requestId: req.id
      });
    }

    if (result.length > 0) {
      logSecurityEvent('DUPLICATE_EMAIL_REGISTRATION', {
        email,
        ip: req.ip,
        requestId: req.id
      });
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists.',
        requestId: req.id
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [full_name, email, hashedPassword], (err, result) => {
      if (err) {
        logger.error({
          type: 'DB_ERROR',
          endpoint: '/api/auth/register',
          error: err.message,
          requestId: req.id
        });
        return res.status(500).json({ 
          success: false,
          message: 'Server error',
          requestId: req.id
        });
      }

      logger.info({
        type: 'USER_REGISTERED',
        email,
        userId: result.insertId,
        ip: req.ip,
        requestId: req.id
      });

      res.status(201).json({ 
        success: true,
        message: 'Registration successful!',
        requestId: req.id
      });
    });
  });
};

// Login
const login = (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn({
      type: 'VALIDATION_ERROR',
      endpoint: '/api/auth/login',
      errors: errors.array(),
      ip: req.ip,
      requestId: req.id
    });
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
      requestId: req.id
    });
  }

  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, result) => {
    if (err) {
      logger.error({
        type: 'DB_ERROR',
        endpoint: '/api/auth/login',
        error: err.message,
        ip: req.ip,
        requestId: req.id
      });
      return res.status(500).json({ 
        success: false,
        message: 'Server error',
        requestId: req.id
      });
    }

    if (result.length === 0) {
      logSecurityEvent('FAILED_LOGIN_USER_NOT_FOUND', {
        email,
        ip: req.ip,
        requestId: req.id
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password.',
        requestId: req.id
      });
    }

    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      logSecurityEvent('FAILED_LOGIN_WRONG_PASSWORD', {
        email,
        userId: user.id,
        ip: req.ip,
        requestId: req.id
      });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password.',
        requestId: req.id
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info({
      type: 'USER_LOGIN_SUCCESS',
      email,
      userId: user.id,
      ip: req.ip,
      requestId: req.id
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { 
        id: user.id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role 
      },
      requestId: req.id
    });
  });
};

module.exports = { register, login };