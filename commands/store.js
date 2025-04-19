const { EmbedBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile, getUser, updateUser } = require('../database');
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
];

const layouts = [
  'layout1.png',
  'layout2.png',
  'layout3.png'
];

module.exports = {
  name: 'store',
  async execute(message) {
    let currentPage = 0;
    let currentTab = 'backgrounds'; // or 'layouts'

    const createBackgroundEmbed = (page) => {
      return new EmbedBuilder()
        .setTitle('🖼️ Loja')
        .setDescription('**BACKGROUNDS**\nPreço: 5000 Synths')
        .addFields({ name: `Background ${page + 1}/${backgrounds.length}`, value: '\u200b' })
        .setImage(`attachment://${backgrounds[page]}`)
        .setColor('#2f3136')
        .setFooter({ text: 'Reaja com 🛒 para comprar este background' });
    };

    const createLayoutEmbed = (page) => {
      return new EmbedBuilder()
        .setTitle('🖼️ Loja')
        .setDescription('**LAYOUTS**\nPreço: 10000 Synths')
        .addFields({ name: `Layout ${page + 1}/${layouts.length}`, value: '\u200b' })
        .setImage(`attachment://${layouts[page]}`)
        .setColor('#2f3136')
        .setFooter({ text: 'Reaja com 🛒 para comprar este layout' });
    };

    const msg = await message.channel.send({
      embeds: [createBackgroundEmbed(currentPage)],
      files: [{
        attachment: `./assets/background/${backgrounds[currentPage]}`,
        name: backgrounds[currentPage]
      }]
    });

    await msg.react('⬅️');
    await msg.react('🛒');
    await msg.react('➡️');

    const filter = (reaction, user) => 
      ['⬅️', '🛒', '➡️', '🎨', '📐'].includes(reaction.emoji.name) && 
      user.id === message.author.id;

    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      await reaction.users.remove(user);

      if (reaction.emoji.name === '🎨') {
        currentTab = 'backgrounds';
        currentPage = 0;
      } else if (reaction.emoji.name === '📐') {
        currentTab = 'layouts';
        currentPage = 0;
      } else if (reaction.emoji.name === '⬅️') {
        if (currentTab === 'backgrounds') {
          currentPage = currentPage > 0 ? --currentPage : backgrounds.length - 1;
        } else {
          currentPage = currentPage > 0 ? --currentPage : layouts.length - 1;
        }
      } else if (reaction.emoji.name === '➡️') {
        if (currentTab === 'backgrounds') {
          currentPage = currentPage + 1 < backgrounds.length ? ++currentPage : 0;
        } else {
          currentPage = currentPage + 1 < layouts.length ? ++currentPage : 0;
        }
      } else if (reaction.emoji.name === '🛒') {
        const userProfile = await getUserProfile(message.author.id);
        const { wallet } = await getUser(message.author.id);
        const price = currentTab === 'backgrounds' ? 5000 : 10000;

        // Check if user already owns the background
        if (currentTab === 'backgrounds' && userProfile.background === backgrounds[currentPage]) {
          return message.reply('**Você já possui este background!**');
        }

        if (wallet < price) {
          return message.reply(`Você não tem Synths suficientes! (Preço: ${price} Synths)`);
        }

        await updateUser(message.author.id, {
          wallet: wallet - price,
          bank: (await getUser(message.author.id)).bank
        });

        const existingProfile = await getUserProfile(message.author.id);
        if (currentTab === 'backgrounds') {
          await updateUserProfile(message.author.id, {
            ...existingProfile,
            background: backgrounds[currentPage]
          });
        } else {
          await updateUserProfile(message.author.id, {
            ...existingProfile,
            layout: layouts[currentPage]
          });
        }

        // Add check reaction to the message and collect reactions
        await msg.react('✅');
        
        const checkFilter = (reaction, user) => 
          reaction.emoji.name === '✅' && user.id === message.author.id;
        
        const checkCollector = msg.createReactionCollector({ filter: checkFilter, time: 30000, max: 1 });
        
        checkCollector.on('collect', async () => {
          // Equip the background
          if (currentTab === 'backgrounds') {
            await updateUserProfile(message.author.id, {
              ...existingProfile,
              background: backgrounds[currentPage]
            });
            message.channel.send('✨ Background equipado com sucesso!');
          }
        });

        // Update the embed to show item as purchased
        const embed = currentTab === 'backgrounds' ? 
          createBackgroundEmbed(currentPage).setDescription('**BACKGROUNDS**\nPreço: 5000 Synths\n✅ Você já possui este background!\n\n*Clique no ✅ para equipar este background!*') :
          createLayoutEmbed(currentPage).setDescription('**LAYOUTS**\nPreço: 10000 Synths\n✅ Você já possui este layout!');

        await msg.edit({
          embeds: [embed],
          files: [{
            attachment: `${currentTab === 'backgrounds' ? './assets/background/' : './assets/layouts/'}${currentTab === 'backgrounds' ? backgrounds[currentPage] : layouts[currentPage]}`,
            name: currentTab === 'backgrounds' ? backgrounds[currentPage] : layouts[currentPage]
          }]
        });

        return message.reply(`✅ ${currentTab === 'backgrounds' ? 'Background' : 'Layout'} comprado com sucesso!`);
      }

      const embed = currentTab === 'backgrounds' ? createBackgroundEmbed(currentPage) : createLayoutEmbed(currentPage);
      const fileName = currentTab === 'backgrounds' ? backgrounds[currentPage] : layouts[currentPage];
      const filePath = currentTab === 'backgrounds' ? './assets/background/' : './assets/layouts/';

      await msg.edit({
        embeds: [embed],
        files: [{
          attachment: `${filePath}${fileName}`,
          name: fileName
        }]
      });
    });

    collector.on('end', () => {
      msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
    });
  }
};
