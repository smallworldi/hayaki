
const { isDeveloper } = require('../utils/developers');
const { db } = require('../database');

module.exports = {
  name: 'resetall',
  async execute(message, args) {
    // Check if user is a developer
    if (!isDeveloper(message.author.id)) {
      return message.reply('Este comando é exclusivo para desenvolvedores.');
    }

    try {
      // Reset all users' XP and level to 0
      await new Promise((resolve, reject) => {
        db.run('UPDATE user_profiles SET xp = 0, level = 0', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Get number of affected users
      const affectedUsers = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM user_profiles', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });

      return message.reply(`✅ Resetado com sucesso o level e XP de ${affectedUsers} usuários.`);
    } catch (error) {
      console.error('Erro ao resetar níveis:', error);
      return message.reply('❌ Ocorreu um erro ao tentar resetar os níveis.');
    }
  }
};
