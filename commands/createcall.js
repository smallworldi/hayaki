
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'createcall',
  description: 'Display embed for creating private voice channels',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('You do not have permission to use this command.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Ready to create your own private voice channel?')
      .setDescription('Click the button below to create a private, exclusive voice channel where you can chat in complete privacy. Have a space reserved for you and your guests, without outside interruptions.')
      .setColor('#000000');

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_voice')
          .setLabel('Create')
          .setStyle(ButtonStyle.Secondary)
      );

    await message.channel.send({
      embeds: [embed],
      components: [button]
    });
  }
};
