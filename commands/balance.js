const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getUser } = require('../database');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

GlobalFonts.registerFromPath(path.join(__dirname, '../assets/fonts/OpenSans-Bold.ttf'), 'Open Sans');




module.exports = {
  name: 'balance',
  description: 'Check your balance with a generated card image.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = await getUser(message.author.id);

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext('2d');


    ctx.fillStyle = '#2b2d31';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px "Open Sans"';
    ctx.fillText(`Wallet: ${user.wallet} Synths`, 50, 100);
    ctx.fillText(`Bank: ${user.bank} Synths`, 50, 150);


    const buffer = canvas.toBuffer('image/png');


    const attachment = new AttachmentBuilder(buffer, { name: 'balance-card.png' });


    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Your Balance')
      .setDescription(`**Wallet:** ${user.wallet} Synths\n**Bank:** ${user.bank} Synths`)
      .setImage('attachment://balance-card.png')
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });


    message.reply({ embeds: [embed], files: [attachment] });
  }
};
