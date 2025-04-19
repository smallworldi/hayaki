const { EmbedBuilder } = require('discord.js');
const { getUserProfile } = require('../database');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'inventory',
  description: 'Mostra os backgrounds que você comprou',
  async execute(message) {
    const profile = await getUserProfile(message.author.id);

    // Verifica se o usuário já tem algum background comprado
    const backgroundsPath = './assets/background/';
    const allBackgrounds = fs.readdirSync(backgroundsPath);

    // Aqui assumimos que o campo `profile.backgrounds` é um array com os nomes dos backgrounds comprados.
    // Caso você ainda não salve dessa forma, me avise pra ajustarmos!
    const userBackgrounds = profile.backgrounds || [];

    if (userBackgrounds.length === 0) {
      return message.reply('❌ Você ainda não comprou nenhum background!');
    }

    // Cria páginas se houver muitos backgrounds
    const itemsPerPage = 1;
    let currentPage = 0;

    const createEmbed = (page) => {
      const bgName = userBackgrounds[page];
      return new EmbedBuilder()
        .setTitle(`🎒 Inventário de ${message.author.username}`)
        .setDescription(`Background ${page + 1}/${userBackgrounds.length}`)
        .setImage(`attachment://${bgName}`)
        .setColor('#2f3136');
    };

    const msg = await message.channel.send({
      embeds: [createEmbed(currentPage)],
      files: [{
        attachment: `${backgroundsPath}${userBackgrounds[currentPage]}`,
        name: userBackgrounds[currentPage]
      }]
    });

    // Reações para navegar
    if (userBackgrounds.length > 1) {
      await msg.react('⬅️');
      await msg.react('➡️');

      const filter = (reaction, user) =>
        ['⬅️', '➡️'].includes(reaction.emoji.name) &&
        user.id === message.author.id;

      const collector = msg.createReactionCollector({ filter, time: 60000 });

      collector.on('collect', async (reaction, user) => {
        await reaction.users.remove(user);

        if (reaction.emoji.name === '⬅️') {
          currentPage = currentPage > 0 ? --currentPage : userBackgrounds.length - 1;
        } else if (reaction.emoji.name === '➡️') {
          currentPage = currentPage + 1 < userBackgrounds.length ? ++currentPage : 0;
        }

        await msg.edit({
          embeds: [createEmbed(currentPage)],
          files: [{
            attachment: `${backgroundsPath}${userBackgrounds[currentPage]}`,
            name: userBackgrounds[currentPage]
          }]
        });
      });

      collector.on('end', () => {
        msg.reactions.removeAll().catch(console.error);
      });
    }
  }
};
