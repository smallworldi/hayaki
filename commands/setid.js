
const { PermissionFlagsBits } = require('discord.js');
const { addToWhitelist, removeFromWhitelist } = require('../utils/whitelist');

module.exports = {
  name: 'setid',
  description: 'Добавить или удалить ID из белого списка антинюка',
  async prefixExecute(message, args) {
    // Проверка владельца сервера
    if (message.author.id !== message.guild.ownerId) {
      return message.reply('Только владелец сервера может использовать эту команду.');
    }

    if (!args[0] || !args[1]) {
      return message.reply('Используйте: !setid <add/remove> <ID>');
    }

    const action = args[0].toLowerCase();
    const userId = args[1];

    if (action === 'add') {
      addToWhitelist(userId);
      message.reply(`ID ${userId} добавлен в белый список антинюка.`);
    } else if (action === 'remove') {
      removeFromWhitelist(userId);
      message.reply(`ID ${userId} удален из белого списка антинюка.`);
    } else {
      message.reply('Используйте: !setid <add/remove> <ID>');
    }
  }
};
