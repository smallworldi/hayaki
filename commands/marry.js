const { EmbedBuilder } = require('discord.js');
const { getUserFullProfile, updateUserProfile } = require('../database');

module.exports = {
  name: 'marry',
  aliases: ['casar'],
  async prefixExecute(message) {
    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Você precisa mencionar um usuário para casar.');

    if (targetUser.id === message.author.id)
      return message.reply('Você não pode se casar consigo mesmo(a)!');

    const profile = await getUserFullProfile(message.author.id);
    if (profile.married_with) return message.reply('Você já está casado(a)!');

    const targetProfile = await getUserFullProfile(targetUser.id);
    if (targetProfile.married_with) return message.reply('Essa pessoa já está casada.');

    const marryEmbed = new EmbedBuilder()
      .setTitle('Pedido de Casamento')
      .setDescription(`${message.author.username} está pedindo ${targetUser.username} em casamento!\n\nReaja com ✅ para aceitar ou ❌ para recusar.`)
      .setColor('#ff69b4')
      .setTimestamp();

    const marryMessage = await message.channel.send({ embeds: [marryEmbed] });
    try {
      await marryMessage.react('✅');
      await marryMessage.react('❌');
    } catch (err) {
      return message.reply('Erro ao adicionar reações. Verifique minhas permissões.');
    }

    const filter = (reaction, user) =>
      ['✅', '❌'].includes(reaction.emoji.name) && user.id === targetUser.id;

    const collector = marryMessage.createReactionCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async reaction => {
      if (reaction.emoji.name === '✅') {
        await updateUserProfile(message.author.id, { married_with: targetUser.username });
        await updateUserProfile(targetUser.id, { married_with: message.author.username });

        message.channel.send(`${targetUser.username} aceitou casar com ${message.author.username}! Felicidades!`);
      } else {
        message.channel.send(`${targetUser.username} rejeitou o pedido de ${message.author.username}.`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (collected.size === 0) {
        message.channel.send('O pedido de casamento expirou por falta de resposta.');
      }
    });
  }
};