const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'testbanlog',
  description: 'Send a test ban log message to the public log channel.',
  execute(message, args) {
    const logChannelId = '1344024905250771005'; // ID do canal de logs públicos
    const reason = args.join(' ') || 'No reason provided.';

    const user = message.author;
    const staff = message.member;

    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Staff', value: `${staff.user.tag} (${staff.id})`, inline: true },
        { name: 'Reason', value: reason, inline: false },
      )
      .setColor('#ff0000')
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
