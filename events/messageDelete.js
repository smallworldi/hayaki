
const { Events } = require('discord.js');
const { LOG_CHANNELS } = require('../config.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const logChannel = message.guild.channels.cache.get(LOG_CHANNELS.messages);
    if (!logChannel) return;

    await logChannel.send({
      embeds: [{
        title: '🗑️ Сообщение удалено',
        description: `**Автор:** ${message.author.tag} (${message.author.id})\n**Канал:** ${message.channel}\n**Содержание:** ${message.content || '*нет текста*'}`,
        color: 0xFF0000,
        timestamp: new Date()
      }]
    });
  }
};
