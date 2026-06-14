const express = require('express');
const router = express.Router();
const { 
  applyVisa, 
  getMyApplications,
  getAllApplications,
  updateStatus
} = require('../controllers/applicationController');
const verifyToken = require('../middleware/authMiddleware');

// User Routes
router.post('/apply', verifyToken, applyVisa);
router.get('/my-applications', verifyToken, getMyApplications);

// Admin Routes
router.get('/all', verifyToken, getAllApplications);
router.put('/status/:id', verifyToken, updateStatus);

module.exports = router;