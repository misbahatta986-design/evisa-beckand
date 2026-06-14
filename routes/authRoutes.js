const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Validation middleware
const registerValidation = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router;