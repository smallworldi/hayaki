const { Events, PermissionsBitField } = require('discord.js');
const { getLanguageButtons } = require('../utils.js');
const { getUserProfile, updateUserProfile, db } = require('../database');

const recentMessages = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;

    // Your existing message handling code here
    const userId = message.author.id;
    const now = Date.now();

    // Verificar se o usuário existe no banco de dados
    const userProfile = await getUserProfile(message.author.id);
    if (!userProfile) {
      await updateUserProfile(message.author.id, {
        level: 1,
        xp: 0,
        xp_goal: 500
      });

      // Adicionar layout preto por padrão
      db.run('INSERT OR IGNORE INTO inventory (user_id, item_type, item_id, equipped) VALUES (?, ?, ?, ?)', 
        [message.author.id, 'layout', 'profileCard', 1]);
    }

    // Rest of your message event code...
  }
};