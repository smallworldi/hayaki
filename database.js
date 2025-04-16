const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./economy.db');

// Criação das tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS balances (
      user_id TEXT PRIMARY KEY,
      wallet INTEGER DEFAULT 1000,
      bank INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cooldowns (
      user_id TEXT,
      command TEXT,
      last_used INTEGER,
      PRIMARY KEY(user_id, command)
    )
  `);
});

// Obter saldo (cria se não existir)
function getUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT wallet, bank FROM balances WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row);

      // Cria novo usuário
      db.run(
        'INSERT INTO balances (user_id, wallet, bank) VALUES (?, ?, ?)',
        [userId, 1000, 0],
        (err) => {
          if (err) return reject(err);
          resolve({ wallet: 1000, bank: 0 });
        }
      );
    });
  });
}

// Atualiza wallet e/ou bank
function updateUser(userId, wallet, bank) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO balances (user_id, wallet, bank)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET wallet = ?, bank = ?`,
      [userId, wallet, bank, wallet, bank],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Cooldowns
function getCooldown(userId, command) {
  return new Promise((resolve, reject) => {
    db.get('SELECT last_used FROM cooldowns WHERE user_id = ? AND command = ?', [userId, command], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.last_used : 0);
    });
  });
}

function setCooldown(userId, command, timestamp) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO cooldowns (user_id, command, last_used)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, command) DO UPDATE SET last_used = ?`,
      [userId, command, timestamp, timestamp],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  getUser,
  updateUser,
  getCooldown,
  setCooldown
};