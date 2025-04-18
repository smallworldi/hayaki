const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildBanAdd',

  async execute(ban) {
    const { guild, user } = ban;
    const logChannelId = '1344024905250771005'; // canal público de logs
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    // pega o moderador e motivo do ban usando audit logs
    const fetchedLogs = await guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      limit: 1,
    });

    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;

    const { executor, reason } = banLog;

    const embed = new EmbedBuilder()
      .setTitle('<:ban:1362591257108676698> Member Banned')
      .addFields(
        {
          name: '<:user:1362591307477811220> User',
          value: `${user.tag} (${user.id})`,
          inline: true,
        },
        {
          name: '<:staff:1362591340004643006> Staff',
          value: `${executor.tag} (${executor.id})`,
          inline: true,
        },
        {
          name: '<:reason:1362591282295472249> Reason',
          value: reason || 'No reason provided.',
          inline: false,
        }
      )
      .setColor('#9a46ca')
      .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
};
