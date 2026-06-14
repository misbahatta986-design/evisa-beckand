require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

const newPassword = 'Misbah123';

const hashedPassword = bcrypt.hashSync(newPassword, 10);

db.query('UPDATE users SET password = ? WHERE email = ?', 
  [hashedPassword, 'misbahatta916@gmail.com'], 
  (err, result) => {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log('Password updated! Affected rows:', result.affectedRows);
    }
    process.exit();
  }
);