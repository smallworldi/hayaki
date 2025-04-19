
const { Events } = require('discord.js');
const { LOG_CHANNELS } = require('../config.js');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const logChannel = oldMessage.guild.channels.cache.get(LOG_CHANNELS.messages);
    if (!logChannel) return;

    await logChannel.send({
      embeds: [{
        title: '✏️ Сообщение изменено',
        description: `**Автор:** ${oldMessage.author.tag} (${oldMessage.author.id})\n**Канал:** ${oldMessage.channel}\n**До:** ${oldMessage.content}\n**После:** ${newMessage.content}`,
        color: 0xFFA500,
        timestamp: new Date()
      }]
    });
  }
};
