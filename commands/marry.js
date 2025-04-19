
const { EmbedBuilder } = require('discord.js');
const { getUserFullProfile, updateUserProfile } = require('../database');

const pendingMarriages = new Set();

module.exports = {
  name: 'marry',
  aliases: ['casar'],
  async prefixExecute(message) {
    if (pendingMarriages.has(message.author.id)) {
      return message.reply('Você já fez um pedido de casamento. Aguarde a resposta.');
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) return message.reply('Você precisa mencionar um usuário para casar.');

    if (targetUser.id === message.author.id)
      return message.reply('Você não pode se casar consigo mesmo(a)!');

    const profile = await getUserFullProfile(message.author.id);
    if (profile.married_with) return message.reply('Você já está casado(a)!');

    const targetProfile = await getUserFullProfile(targetUser.id);
    if (targetProfile.married_with) return message.reply('Essa pessoa já está casada.');

    pendingMarriages.add(message.author.id);

    const marryEmbed = new EmbedBuilder()
      .setTitle('Pedido de Casamento')
      .setDescription(`${message.author.tag} está pedindo ${targetUser.tag} em casamento!\n\nReaja com ✅ para aceitar ou ❌ para recusar.`)
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
      pendingMarriages.delete(message.author.id);

      if (reaction.emoji.name === '✅') {
        const authorProfile = await getUserFullProfile(message.author.id);
        const targetProfile = await getUserFullProfile(targetUser.id);

        await updateUserProfile(message.author.id, {
          xp: authorProfile.xp || 0,
          level: authorProfile.level || 0,
          bio: authorProfile.bio || '',
          background: authorProfile.background || '',
          married_with: targetUser.id,
          badges: authorProfile.badges || ''
        });

        await updateUserProfile(targetUser.id, {
          xp: targetProfile.xp || 0,
          level: targetProfile.level || 0,
          bio: targetProfile.bio || '',
          background: targetProfile.background || '',
          married_with: message.author.id,
          badges: targetProfile.badges || ''
        });

        message.channel.send(`${targetUser.tag} aceitou casar com ${message.author.tag}! Felicidades!`);
      } else {
        message.channel.send(`${targetUser.tag} rejeitou o pedido de ${message.author.tag}.`);
      }

      marryMessage.reactions.removeAll().catch(() => {});
    });

    collector.on('end', async (collected, reason) => {
      pendingMarriages.delete(message.author.id);

      if (collected.size === 0) {
        const expiredEmbed = EmbedBuilder.from(marryEmbed)
          .setDescription(`O pedido de casamento expirou! Tempo esgotado.`)
          .setColor('#808080');

        await marryMessage.edit({ embeds: [expiredEmbed] }).catch(() => {});
        marryMessage.reactions.removeAll().catch(() => {});
      }
    });
  }
};
