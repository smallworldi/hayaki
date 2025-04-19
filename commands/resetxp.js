
const { updateUserProfile, getUserProfile } = require('../database');

module.exports = {
  name: 'resetxp',
  async prefixExecute(message) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Você precisa ser um administrador para usar este comando.');
    }

    const target = message.mentions.users.first() || message.author;
    
    await updateUserProfile(target.id, {
      xp: 0,
      level: 0
    });

    return message.reply(`XP e level de ${target.tag} foram resetados para 0.`);
  }
};
