const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, PNG allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadDocument = (req, res) => {
  const application_id = req.params.application_id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ 
      success: false, 
      message: 'کوئی file نہیں ملی!' 
    });
  }

  const sql = `INSERT INTO documents
    (application_id, file_name, file_path, file_type) 
    VALUES (?, ?, ?, ?)`;

  db.query(sql, [
    application_id,
    file.originalname,
    file.path,
    file.mimetype
  ], (err, result) => {
    if (err) return res.status(500).json({ 
      success: false, message: err.message 
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully!',
      file_name: file.originalname
    });
  });
};

const getDocuments = (req, res) => {
  const application_id = req.params.application_id;

  db.query(
    'SELECT * FROM documents WHERE application_id = ?',
    [application_id],
    (err, results) => {
      if (err) return res.status(500).json({ 
        success: false, message: err.message 
      });
      res.status(200).json({ 
        success: true, 
        data: results 
      });
    }
  );
};

module.exports = { upload, uploadDocument, getDocuments };
