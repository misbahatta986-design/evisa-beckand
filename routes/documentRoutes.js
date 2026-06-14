const express = require('express');
const router = express.Router();
const { upload, uploadDocument, getDocuments } = require('../controllers/documentController');
const verifyToken=require('../middleware/authMiddleware');
router.post('/upload/:application_id', verifyToken, upload.single('document'), uploadDocument);
router.get('/:application_id', verifyToken,getDocuments);
module.exports=router;