
const { Events } = require('discord.js');
const { LOG_CHANNELS } = require('../config.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const logChannel = member.guild.channels.cache.get(LOG_CHANNELS.members);
    if (logChannel) {
      await logChannel.send({
        embeds: [{
          title: '👋 Member Joined',
          description: `**User:** ${member.user.tag}\n**ID:** ${member.id}`,
          color: 0x00FF00
        }]
      });
    }
  }
};
