const { EmbedBuilder } = require('discord.js');
const { getUser } = require('../database');
const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');

module.exports = {
  name: 'balance',
  description: 'Check your balance with a generated card image.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = await getUser(message.author.id);


    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext('2d');

    // Preencher o fundo com uma cor
    ctx.fillStyle = '#2b2d31'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = '#ffffff'; 
    ctx.font = '30px Arial';
    ctx.fillText(`Wallet: ${user.wallet} Synths`, 50, 100);
    ctx.fillText(`Bank: ${user.bank} Synths`, 50, 150);


    const attachment = new MessageAttachment(canvas.toBuffer(), 'balance-card.png');


    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Your Balance')
      .setDescription(`**Wallet:** ${user.wallet} Synths\n**Bank:** ${user.bank} Synths`)
      .setImage('attachment://balance-card.png') // Usar a imagem gerada
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });


    message.reply({ embeds: [embed], files: [attachment] });
  }
};