const db = require('../config/db');

const getNotifications = (req, res) => {
  const user_id = req.user.id;
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.status(200).json({ success: true, data: results });
    }
  );
};

const markAsRead = (req, res) => {
  const user_id = req.user.id;
  db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.status(200).json({ success: true, message: 'All notifications marked as read!' });
    }
  );
};

module.exports = { getNotifications, markAsRead };
