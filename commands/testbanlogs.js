const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'testbanlog',
  description: 'Send a test ban log message to the public log channel.',
  execute(message, args) {
    const logChannelId = '1344024905250771005';
    const reason = args.join(' ') || 'No reason provided.';

    const user = message.author;
    const staff = message.member;

    const embed = new EmbedBuilder()
      .setTitle('<:ban:1362591257108676698> Member Banned')
      .addFields(
        { name: '<:user:1362591307477811220> User', value: `${user.tag} (${user.id})`, inline: true },
        { name: '<:staff:1362591340004643006> Staff', value: `${staff.user.tag} (${staff.id})`, inline: true },
        { name: '<:reason:1362591282295472249> Reason', value: reason, inline: false },
      )
      .setColor('#9a46ca')
      .setTimestamp();

    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) {
      return message.reply('❌ Could not find the log channel.');
    }

    logChannel.send({ embeds: [embed] })
      .then(() => {
        message.reply('✅ Test ban log sent.');
      })
      .catch(err => {
        console.error(err);
        message.reply('❌ Failed to send the log.');
      });
  }
};
