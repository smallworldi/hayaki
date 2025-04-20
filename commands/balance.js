const { createCanvas, loadImage, registerFont } = require('canvas');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

// Registra a fonte Noto Sans
registerFont('./assets/fonts/NotoSans-Regular.ttf', { family: 'Noto Sans' });

module.exports = {
  name: 'balance',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = await getUser(message.author.id);
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');

    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 400, 200);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#090909');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 200);

    // Horário de Moscou
    const moscowTime = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const hour = new Date(moscowTime).getHours();

    let greeting;
    if (hour >= 5 && hour < 12) greeting = 'Доброе утро';
    else if (hour >= 12 && hour < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Noto Sans"';
    ctx.fillText(greeting, 20, 30);
    ctx.font = 'bold 20px "Noto Sans"';
    ctx.fillText(message.author.username, 20, 55);

    // Balance
    ctx.font = '14px "Noto Sans"';
    ctx.fillText('Общий Баланс', 20, 85);
    ctx.font = 'bold 32px "Noto Sans"';
    ctx.fillText(`${user.wallet.toLocaleString('ru-RU')} ₽`, 20, 125);

    // Número do cartão
    ctx.font = '14px "Noto Sans"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`**** **** ${message.author.id.slice(-4)}`, 20, 155);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'balance.png' });

    const embed = new EmbedBuilder()
      .setColor('#000001')
      .setImage('attachment://balance.png');

    await message.reply({ embeds: [embed], files: [attachment] });
  }
};
