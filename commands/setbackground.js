
const { EmbedBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile } = require('../database');
const fs = require('fs');
const path = require('path');

const backgrounds = [
  'background.png', // Background padrão
  'background1.png',
  'background2.png',
  'background3.png',
  'background4.png',
  'background5.png',
  'background6.png',
  'background7.png',
  'background8.png',
  'background9.png',
];

module.exports = {
  name: 'setbackground',
  async execute(message) {
    let currentPage = 0;
    
    const createEmbed = (page) => {
      const embed = new EmbedBuilder()
        .setTitle('🖼️ Loja de Backgrounds')
        .setDescription(`Background ${page + 1}/${backgrounds.length}\nPreço: 5000 Synths`)
        .setImage(`attachment://${backgrounds[page]}`)
        .setColor('#2f3136')
        .setFooter({ text: 'Reaja com 🛒 para comprar este background' });
      
      return embed;
    };

    const msg = await message.channel.send({
      embeds: [createEmbed(currentPage)],
      files: [{
        attachment: `./assets/background/${backgrounds[currentPage]}`,
        name: backgrounds[currentPage]
      }]
    });

    await msg.react('⬅️');
    await msg.react('🛒');
    await msg.react('➡️');

    const filter = (reaction, user) => 
      ['⬅️', '🛒', '➡️'].includes(reaction.emoji.name) && 
      user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      await reaction.users.remove(user);

      if (reaction.emoji.name === '⬅️') {
        currentPage = currentPage > 0 ? --currentPage : backgrounds.length - 1;
      } else if (reaction.emoji.name === '➡️') {
        currentPage = currentPage + 1 < backgrounds.length ? ++currentPage : 0;
      } else if (reaction.emoji.name === '🛒') {
        const userProfile = await getUserProfile(message.author.id);
        
        // Não cobra se for o background padrão
        if (currentPage === 0) {
          await updateUserProfile(message.author.id, {
            ...userProfile,
            background: backgrounds[currentPage]
          });
          return message.reply(`✅ Background padrão definido com sucesso!`);
        }
        
        if (userProfile.balance < 5000) {
          return message.reply('Você não tem Synths suficientes! (Preço: 5000 Synths)');
        }

        await updateUserProfile(message.author.id, {
          ...userProfile,
          balance: userProfile.balance - 5000,
          background: backgrounds[currentPage]
        });

        return message.reply(`✅ Background comprado com sucesso!`);
      }

      await msg.edit({
        embeds: [createEmbed(currentPage)],
        files: [{
          attachment: `./assets/background/${backgrounds[currentPage]}`,
          name: backgrounds[currentPage]
        }]
      });
    });

    collector.on('end', () => {
      msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
    });
  }
};
