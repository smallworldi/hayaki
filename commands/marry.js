const { MessageEmbed } = require('discord.js');
const { getUserFullProfile, updateUserProfile } = require('../database'); // Funções para atualizar o perfil no banco de dados

module.exports = {
  name: 'marry',
  aliases: ['casar'],
  async prefixExecute(message) {
    const args = message.content.split(' ');
    const targetUser = message.mentions.users.first();

    if (!targetUser) {
      return message.reply('Você precisa mencionar um usuário para fazer o pedido de casamento!');
    }

    // Verifica se o usuário já está casado
    const profile = await getUserFullProfile(message.author.id);
    if (profile.married_with) {
      return message.reply('Você já está casado(a)!');
    }

    // Verifica se o usuário mencionado já está casado
    const targetProfile = await getUserFullProfile(targetUser.id);
    if (targetProfile.married_with) {
      return message.reply(`${targetUser.username} já está casado(a)!`);
    }

    // Envia a mensagem com reações para o usuário ser solicitado
    const marryEmbed = new MessageEmbed()
      .setTitle('Pedido de Casamento')
      .setDescription(`${message.author.username} está pedindo a sua mão em casamento! Você aceita?`)
      .setColor('#ff69b4')
      .setTimestamp();

    const marryMessage = await message.channel.send({ embeds: [marryEmbed] });
    await marryMessage.react('✅');
    await marryMessage.react('❌');

    // Função para verificar a reação
    const filter = (reaction, user) => {
      return ['✅', '❌'].includes(reaction.emoji.name) && user.id === targetUser.id;
    };

    // Espera pela reação do usuário
    const collector = marryMessage.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '✅') {
        // Casamento aceito
        await updateUserProfile(message.author.id, { married_with: targetUser.username });
        await updateUserProfile(targetUser.id, { married_with: message.author.username });
        
        message.channel.send(`${targetUser.username} aceitou o casamento com ${message.author.username}! Parabéns ao casal!`);
      } else if (reaction.emoji.name === '❌') {
        // Casamento negado
        message.channel.send(`${targetUser.username} rejeitou o pedido de casamento de ${message.author.username}.`);
      }
      collector.stop();
    });

    collector.on('end', () => {
      // Caso o tempo expire sem reação
      if (!marryMessage.reactions.cache.some(reaction => reaction.emoji.name === '✅' || reaction.emoji.name === '❌')) {
        message.channel.send('O tempo para a resposta do pedido de casamento expirou.');
      }
    });
  }
};