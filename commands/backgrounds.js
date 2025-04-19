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
  name: 'backgrounds',
  async execute(message) {
    let currentPage = 0;
    
    const createEmbed = (page) => {
      return new EmbedBuilder()
        .setTitle('🖼️ Фоны профиля')
        .setDescription(`Фон ${page + 1}/${backgrounds.length}`)
        .setImage(`attachment://${backgrounds[page]}`)
        .setColor('#2f3136')
        .setFooter({ text: 'Нажми ✅ чтобы выбрать этот фон' });
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
      ['⬅️', '✅', '➡️'].includes
