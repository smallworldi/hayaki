
const { EmbedBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile } = require('../database');
const fs = require('fs');
const path = require('path');

const backgrounds = [
  'background.png',
  'background1.png',
  'background2.png',
  'background3.png',
  'background4.png',
  'background5.png',
  'background6.png',
  'background7.png',
  'background8.png',
  'background9.png',
  'background10.png',
  'background11.png',
  'background12.png',
  'background13.png',
  'background14.png',
];

module.exports = {
  name: 'background',
  async execute(message) {
    let currentPage = 0;
    
    const createEmbed = (page) => {
      return new EmbedBuilder()
        .setTitle('🖼️ Backgrounds')
        .setDescription(`Background ${page + 1}/${backgrounds.length}`)
        .setImage(`attachment://${backgrounds[page]}`)
        .setColor('#2f3136')
        .setFooter({ text: 'Reaja com ✅ para selecionar este background' });
    };

    const msg = await message.channel.send({
      embeds: [createEmbed(currentPage)],
      files: [{
        attachment: `./assets/background/${backgrounds[currentPage]}`,
        name: backgrounds[currentPage]
      }]
    });

    await msg.react('⬅️');
    await msg.react('✅');
    await msg.react('➡️');

    const filter = (reaction, user) => 
      ['⬅️', '✅', '➡️'].includes(reaction.emoji.name) && 
      user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      await reaction.users.remove(user);

      if (reaction.emoji.name === '⬅️') {
        currentPage = currentPage > 0 ? --currentPage : backgrounds.length - 1;
      } else if (reaction.emoji.name === '➡️') {
        currentPage = currentPage + 1 < backgrounds.length ? ++currentPage : 0;
      } else if (reaction.emoji.name === '✅') {
        const userProfile = await getUserProfile(message.author.id);
        
        // Adicionar o background à coleção do usuário
        let userBackgrounds = userProfile.backgrounds || [];
        if (typeof userBackgrounds === 'string') {
          userBackgrounds = userBackgrounds.split(',').filter(bg => bg);
        } else if (!Array.isArray(userBackgrounds)) {
          userBackgrounds = [];
        }
        
        if (!userBackgrounds.includes(backgrounds[currentPage])) {
          userBackgrounds.push(backgrounds[currentPage]);
        }

        await updateUserProfile(message.author.id, {
          ...userProfile,
          background: backgrounds[currentPage],
          backgrounds: userBackgrounds
        });

        return message.reply(`✅ Background selecionado com sucesso!`);
      }

      await msg.edit({
        embeds: [createEmbed(currentPage)],
        files: [{
          attachment: `./assets/background/${backgrounds[currentPage]}`,
          name: backgrounds[currentPage]
        }]
      });
    });
  }
};
