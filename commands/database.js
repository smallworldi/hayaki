const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./economy.db');


db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS balances (user_id TEXT PRIMARY KEY, balance INTEGER)');
});


function getBalance(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT balance FROM balances WHERE user_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      resolve(row ? row.balance : 1000);
    });
  });
}


function updateBalance(userId, balance) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO balances (user_id, balance) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = ?',
      [userId, balance, balance],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

module.exports = { getBalance, updateBalance };
