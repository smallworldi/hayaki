
const { Events } = require('discord.js');

const JOIN_THRESHOLD = 10; // Number of joins
const JOIN_WINDOW = 30000; // Time window in milliseconds (30 seconds)
const recentJoins = new Set();
let raidMode = false;

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const { isWhitelisted } = require('../utils/whitelist');
    if (isWhitelisted(member.id, member.guild)) return;
    recentJoins.add(member.id);
    setTimeout(() => recentJoins.delete(member.id), JOIN_WINDOW);

    if (recentJoins.size >= JOIN_THRESHOLD && !raidMode) {
      raidMode = true;
      const guild = member.guild;

      // Lock all channels
      const channels = guild.channels.cache.filter(c => c.type === 0);
      for (const [, channel] of channels) {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: false
        });
      }

      // Notify staff
      const logChannel = guild.channels.cache.get('YOUR_LOG_CHANNEL_ID');
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '🚨 RAID DETECTION',
            description: `Raid mode activated!\n${recentJoins.size} members joined in ${JOIN_WINDOW/1000} seconds.`,
            color: 0xFF0000
          }]
        });
      }

      // Reset raid mode after 5 minutes
      setTimeout(() => {
        raidMode = false;
        recentJoins.clear();
      }, 5 * 60 * 1000);
    }
  }
};
