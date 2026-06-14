const db = require('../config/db');

// Apply for Visa
const applyVisa = (req, res) => {
  const { visa_type, full_name, passport_no, nationality } = req.body;
  const user_id = req.user.id;

  if (!visa_type || !full_name || !passport_no || !nationality) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields required.' 
    });
  }

  const reference_no = 'EV-' + Date.now();

  const sql = `INSERT INTO applications 
    (user_id, reference_no, visa_type, full_name, passport_no, nationality, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'submitted')`;

  db.query(sql, [user_id, reference_no, visa_type, full_name, passport_no, nationality], 
  (err, result) => {
    if (err) return res.status(500).json({ 
      success: false, message: err.message 
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      reference_no: reference_no
    });
  });
};

// Get My Applications
const getMyApplications = (req, res) => {
  const user_id = req.user.id;

  db.query(
    'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC',
    [user_id], 
    (err, results) => {
      if (err) return res.status(500).json({ 
        success: false, message: err.message 
      });
      res.status(200).json({ success: true, data: results });
    }
  );
};

// Get All Applications (Admin)
const getAllApplications = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admins only.' 
    });
  }

  db.query(
    'SELECT * FROM applications ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ 
        success: false, message: err.message 
      });
      res.status(200).json({ success: true, data: results });
    }
  );
};

// Update Status (Admin)
// const updateStatus = (req, res) => {
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ 
//       success: false, 
//       message: 'Access denied. Admins only.' 
//     });
//   }

//   const { status } = req.body;
//   const { id } = req.params;

//   db.query(
//     'UPDATE applications SET status = ? WHERE id = ?',
//     [status, id],
//     (err, result) => {
//       if (err) return res.status(500).json({ 
//         success: false, message: err.message 
//       });
//       res.status(200).json({ 
//         success: true, 
//         message: 'Status updated!' 
//       });
//     }
//   );
// };

// module.exports = { applyVisa, getMyApplications, getAllApplications, updateStatus };
const updateStatus = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  const { status } = req.body;
  const { id } = req.params;

  const allowedStatuses = ['submitted', 'in_review', 'approved', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  db.query('UPDATE applications SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // ✅ Auto notification insert
    const messages = {
      submitted:  'Your application has been received and is under review.',
      in_review:  'Your application is currently being reviewed by our officers.',
      approved:   'Congratulations! Your visa application has been approved.',
      rejected:   'Unfortunately, your visa application has been rejected.'
    };

    db.query('SELECT user_id, reference_no FROM applications WHERE id = ?', [id], (err2, rows) => {
      if (!err2 && rows.length > 0) {
        const { user_id, reference_no } = rows[0];
        const title = `Application ${status.replace('_', ' ').toUpperCase()} — ${reference_no}`;
        const message = messages[status];
        db.query(
          'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
          [user_id, title, message],
          () => {}
        );
      }
    });

    res.status(200).json({ success: true, message: 'Status updated successfully!' });
  });
};
module.exports = { applyVisa, getMyApplications, getAllApplications, updateStatus };