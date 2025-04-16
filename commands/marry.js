const { EmbedBuilder } = require('discord.js');
const { getUserFullProfile, updateUserProfile } = require('../database');

const pendingMarriages = new Set(); // Para evitar pedidos duplicados

module.exports = {
  name: 'marry',
  aliases: ['casar'],
  async prefixExecute(message) {
    // Verifica se já existe um pedido pendente
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

    // Adiciona o autor na lista de pedidos pendentes
    pendingMarriages.add(message.author.id);

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
      // Remove o autor da lista de pedidos pendentes
      pendingMarriages.delete(message.author.id);

      if (reaction.emoji.name === '✅') {
        await updateUserProfile(message.author.id, { married_with: targetUser.id });
        await updateUserProfile(targetUser.id, { married_with: message.author.id });

        message.channel.send(`${targetUser.username} aceitou casar com ${message.author.username}! Felicidades!`);
      } else {
        message.channel.send(`${targetUser.username} rejeitou o pedido de ${message.author.username}.`);
      }

      // Remove reações após resposta
      marryMessage.reactions.removeAll().catch(() => {});
    });

    collector.on('end', async (collected, reason) => {
      // Remove o autor da lista de pedidos pendentes se o pedido expirou
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