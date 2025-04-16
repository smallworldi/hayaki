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

  db.run(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      bio TEXT DEFAULT '',
      background TEXT DEFAULT ''
    )
  `, () => {
    // Verificar e adicionar coluna 'badges' se não existir
    db.all("PRAGMA table_info(user_profiles)", (err, columns) => {
      if (err) return console.error('Erro ao verificar colunas:', err);

      const hasBadges = columns.some(col => col.name === 'badges');
      if (!hasBadges) {
        db.run(`ALTER TABLE user_profiles ADD COLUMN badges TEXT DEFAULT ''`, (err) => {
          if (err) console.error('Erro ao adicionar coluna badges:', err.message);
        });
      }
    });
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS xp_leaderboard (
      user_id TEXT,
      guild_id TEXT,
      xp INTEGER,
      level INTEGER,
      PRIMARY KEY (user_id, guild_id)
    )
  `);
});

// Funções de saldo
function getUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT wallet, bank FROM balances WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row);

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

function updateUser(userId, user) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO balances (user_id, wallet, bank)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET wallet = ?, bank = ?`,
      [userId, user.wallet, user.bank, user.wallet, user.bank],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Perfil de usuário
function getUserProfile(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT xp, level, bio, background, badges FROM user_profiles WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row);

      db.run(
        'INSERT INTO user_profiles (user_id, xp, level, bio, background, badges) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 0, 1, '', '', ''],
        (err) => {
          if (err) return reject(err);
          resolve({ xp: 0, level: 1, bio: '', background: '', badges: '' });
        }
      );
    });
  });
}

function updateUserProfile(userId, userProfile) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO user_profiles (user_id, xp, level, bio, background, badges)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET xp = ?, level = ?, bio = ?, background = ?, badges = ?`,
      [
        userId,
        userProfile.xp,
        userProfile.level,
        userProfile.bio,
        userProfile.background,
        userProfile.badges,
        userProfile.xp,
        userProfile.level,
        userProfile.bio,
        userProfile.background,
        userProfile.badges
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Leaderboard
function getXPLeaderboard(guildId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT user_id, xp, level FROM xp_leaderboard WHERE guild_id = ? ORDER BY xp DESC', [guildId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function updateXPLeaderboard(userId, guildId, xp, level) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO xp_leaderboard (user_id, guild_id, xp, level)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, guild_id) DO UPDATE SET xp = ?, level = ?`,
      [userId, guildId, xp, level, xp, level],
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

// Exportar tudo
module.exports = {
  getUser,
  updateUser,
  getUserProfile,
  updateUserProfile,
  getXPLeaderboard,
  updateXPLeaderboard,
  getCooldown,
  setCooldown
};