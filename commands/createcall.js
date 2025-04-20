
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'createcall',
  description: 'Display embed for creating private voice channels',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('You do not have permission to use this command.');
    }

    const embed = new EmbedBuilder()
      .setTitle('Pronto para criar seu próprio canal de voz privado?')
      .setDescription('Clique no botão abaixo para criar um canal de voz exclusivo e privado, onde você poderá conversar com total privacidade. Tenha um espaço reservado para você e seus convidados, sem interrupções externas.')
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
