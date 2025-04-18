const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'testbanlog',
  description: 'Sends a fake ban log embed to the public punishment log channel',
  execute(message, args) {
    const logChannel = message.guild.channels.cache.get('1344024905250771005');
    if (!logChannel) {
      return message.reply('❌ Log channel not found.');
    }

    const fakeUser = {
      tag: 'FakeUser#1234',
      id: '123456789012345678',
      displayAvatarURL: () => 'https://i.imgur.com/AfFp7pu.png', // placeholder avatar
    };

    const fakeExecutor = {
      tag: message.author.tag,
      id: message.author.id,
    };

    const reason = args.join(' ') || 'Testing punishment log embed.';

    const embed = new EmbedBuilder()
      .setTitle('🔨 Member Banned')
      .setColor('#ff0000')
      .addFields(
        { name: 'User', value: `${fakeUser.tag} (${fakeUser.id})`, inline: false },
        { name: 'Banned by', value: `${fakeExecutor.tag} (${fakeExecutor.id})`, inline: false },
        { name: 'Reason', value: reason, inline: false },
      )
      .setThumbnail(fakeUser.displayAvatarURL())
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
    message.reply('✅ Test ban log sent.');
  }
};
