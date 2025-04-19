
const { EmbedBuilder, AttachmentBuilder, createCanvas } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'pay',
  description: 'Pay another user Synths.',
  async prefixExecute(message, args) {
    // First message asking for user ID
    const idMsg = await message.reply('**Qual o ID do usuário que deseja transferir?**');
    
    const idFilter = m => m.author.id === message.author.id;
    const idCollector = message.channel.createMessageCollector({ 
      filter: idFilter, 
      time: 30000,
      max: 1 
    });

    idCollector.on('collect', async (idResponse) => {
      const targetId = idResponse.content;
      const member = await message.guild.members.fetch(targetId).catch(() => null);

      if (!member || member.user.bot || member.id === message.author.id) {
        message.reply('ID de usuário inválido.');
        idMsg.delete().catch(() => {});
        idResponse.delete().catch(() => {});
        return;
      }

      // Ask for amount after valid ID
      const amountMsg = await message.reply('**Qual a quantia que deseja transferir?**');
      
      const amountFilter = m => m.author.id === message.author.id && !isNaN(m.content);
      const amountCollector = message.channel.createMessageCollector({ 
        filter: amountFilter, 
        time: 30000,
        max: 1 
      });

      amountCollector.on('collect', async (amountResponse) => {
        const amount = parseInt(amountResponse.content);
        
        if (isNaN(amount) || amount <= 0) {
          message.reply('Quantia inválida.');
          return;
        }

        const sender = await getUser(message.author.id);
        const receiver = await getUser(member.id);

        if (sender.wallet < amount) {
          message.reply('Saldo insuficiente.');
          return;
        }

        sender.wallet -= amount;
        receiver.wallet += amount;

        await updateUser(message.author.id, sender);
        await updateUser(member.id, receiver);

        // Create transfer confirmation image
        const canvas = createCanvas(400, 200);
        const ctx = canvas.getContext('2d');

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 400, 200);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#090909');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 200);

        // Check mark
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(175, 100);
        ctx.lineTo(200, 125);
        ctx.lineTo(225, 75);
        ctx.stroke();

        // Transfer details
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${amount.toLocaleString('ru-RU')} ₽`, 200, 160);
        ctx.font = '16px Arial';
        ctx.fillText(`ID: ${member.id}`, 200, 180);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'transfer.png' });
        const embed = new EmbedBuilder()
          .setColor('#4CAF50')
          .setTitle('Transferência Concluída')
          .setImage('attachment://transfer.png');

        message.reply({ embeds: [embed], files: [attachment] });

        // Clean up messages
        idMsg.delete().catch(() => {});
        amountMsg.delete().catch(() => {});
        idResponse.delete().catch(() => {});
        amountResponse.delete().catch(() => {});
      });
    });
  }
};
