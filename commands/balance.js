const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getUser } = require('../database');
const { createCanvas } = require('canvas');

module.exports = {
  name: 'balance',
  description: 'Check your balance with a generated card image.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = await getUser(message.author.id);

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#2b2d31';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px sans-serif';
    ctx.fillText(`Wallet: ${user.wallet} Synths`, 50, 100);
    ctx.fillText(`Bank: ${user.bank} Synths`, 50, 150);

    // Gerar o buffer da imagem
    const buffer = canvas.toBuffer('image/png');

    // Criar o anexo
    const attachment = new AttachmentBuilder(buffer, { name: 'balance-card.png' });

    // Criar embed com imagem
    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Your Balance')
      .setDescription(`**Wallet:** ${user.wallet} Synths\n**Bank:** ${user.bank} Synths`)
      .setImage('attachment://balance-card.png')
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    // Enviar resposta
    message.reply({ embeds: [embed], files: [attachment] });
  }
};