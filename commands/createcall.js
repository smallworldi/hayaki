
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'createcall',
  description: 'Exibir embed para criação de calls privadas',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('Você não tem permissão para usar este comando.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🎮 Criar Call Privada')
      .setDescription('Clique no botão abaixo para criar sua call privada')
      .setColor('#000000');

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_voice')
          .setLabel('Criar')
          .setStyle(ButtonStyle.Primary)
      );

    await message.channel.send({
      embeds: [embed],
      components: [button]
    });
  }
};
