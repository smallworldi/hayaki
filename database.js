const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./economy.db');

// Criação das tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS balances (
      user_id TEXT PRIMARY KEY,
      balance INTEGER DEFAULT 1000
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

// Obter saldo (e criar se não existir)
function getBalance(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT balance FROM balances WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row.balance);

      // Cria novo usuário com saldo inicial
      db.run('INSERT INTO balances (user_id, balance) VALUES (?, ?)', [userId, 1000], (err) => {
        if (err) return reject(err);
        resolve(1000);
      });
    });
  });
}

// Atualizar saldo
function updateBalance(userId, newBalance) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO balances (user_id, balance)
       VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET balance = ?`,
      [userId, newBalance, newBalance],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Obter cooldown de um comando
function getCooldown(userId, command) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT last_used FROM cooldowns WHERE user_id = ? AND command = ?',
      [userId, command],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.last_used : 0);
      }
    );
  });
}

// Atualizar cooldown de um comando
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
  getBalance,
  updateBalance,
  getCooldown,
  setCooldown
};