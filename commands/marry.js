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
      .setDescription(`${message.author.username} está pedindo ${targetUser.username} em casamento! Aceita?`)
      .setColor('#ff69b4')
      .setTimestamp();

    const marryMessage = await message.channel.send({ embeds: [marryEmbed] });
    await marryMessage.react('✅');
    await marryMessage.react('❌');

    const filter = (reaction, user) =>
      ['✅', '❌'].includes(reaction.emoji.name) && user.id === targetUser.id;

    marryMessage.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first();
        if (reaction.emoji.name === '✅') {
          await updateUserProfile(message.author.id, { married_with: targetUser.username });
          await updateUserProfile(targetUser.id, { married_with: message.author.username });
          return message.channel.send(`${targetUser.username} aceitou casar com ${message.author.username}! Felicidades!`);
        } else {
          return message.channel.send(`${targetUser.username} rejeitou o pedido de ${message.author.username}.`);
        }
      })
      .catch(() => {
        message.channel.send('O pedido de casamento expirou por falta de resposta.');
      });
  }
};