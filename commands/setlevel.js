
const { updateUserProfile } = require('../database');

module.exports = {
  name: 'setlevel',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Você precisa ser um administrador para usar este comando.');
    }

    const level = parseInt(args[0]);
    if (isNaN(level) || level < 0) {
      return message.reply('Por favor, forneça um nível válido.');
    }

    await updateUserProfile(message.author.id, { level });
    return message.reply(`Seu nível foi definido para ${level}.`);
  }
};
