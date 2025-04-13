
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'createcall',
  description: 'Display embed for creating private voice channels',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('You do not have permission to use this command.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🎮 Create Private Call')
      .setDescription('Click the button below to create your private voice channel')
      .setColor('#000000');

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_voice')
          .setLabel('Create')
          .setStyle(ButtonStyle.Primary)
      );

    await message.channel.send({
      embeds: [embed],
      components: [button]
    });
  }
};
