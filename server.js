const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/db');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');


const app = express();

// Security Middleware
app.use(helmet()); // Set security headers

// CORS Configuration

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static Files
app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname));

// Request Logger Middleware
app.use(requestLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all requests
app.use(limiter);

// Stricter rate limit for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login/register attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'E-Visa Backend Server is Running!' });
});

// 404 Handler
app.use((req, res) => {
  logger.warn({
    type: '404_NOT_FOUND',
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler (MUST be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`✓ Server running on port ${PORT}`);
});