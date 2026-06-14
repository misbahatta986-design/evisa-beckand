const express = require('express');
const router = express.Router();
const {getNotifications,markAsRead}=require('../controllers/notificationController');
const verifyToken=require('../middleware/authMiddleware');
router.get('/',verifyToken,getNotifications);
router.put('/read',verifyToken,markAsRead);
module.exports=router;