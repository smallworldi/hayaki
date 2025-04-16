const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./economy.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS balances (
    user_id TEXT PRIMARY KEY,
    wallet INTEGER DEFAULT 1000,
    bank INTEGER DEFAULT 0,
    lastDaily INTEGER DEFAULT 0,
    lastWork INTEGER DEFAULT 0
  )`);
});

function getUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM balances WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      if (!row) {
        const newUser = {
          wallet: 1000,
          bank: 0,
          lastDaily: 0,
          lastWork: 0
        };
        db.run('INSERT INTO balances (user_id) VALUES (?)', [userId], (err) => {
          if (err) return reject(err);
          resolve({ user_id: userId, ...newUser });
        });
      } else {
        resolve(row);
      }
    });
  });
}

function updateUser(userId, data) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE balances SET wallet = ?, bank = ?, lastDaily = ?, lastWork = ? WHERE user_id = ?`,
      [data.wallet, data.bank, data.lastDaily, data.lastWork, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = { getUser, updateUser };