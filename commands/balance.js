const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./assets/fonts/NotoSans-Bold.ttf', { family: 'NotoSans' });
const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'balance',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = await getUser(message.author.id);
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 200);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#090909');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 200);

    // Moscow time greeting
    const moscowTime = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const hour = new Date(moscowTime).getHours();
    
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px NotoSans';
    ctx.fillText(greeting, 20, 30);
    ctx.font = 'bold 20px NotoSans';
    ctx.fillText(message.author.username, 20, 55);

    // Balance
    ctx.font = '14px NotoSans';
    ctx.fillText('Total Balance', 20, 85);
    ctx.font = 'bold 32px NotoSans';
    ctx.fillText(`${user.wallet.toLocaleString('en-US')} ₽`, 20, 125);

    // Card number style
    ctx.font = '14px NotoSans';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(`**** **** ${message.author.id.slice(-4)}`, 20, 155);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'balance.png' });
    
    const embed = new EmbedBuilder()
      .setColor('#000001')
      .setImage('attachment://balance.png');

    const msg = await message.reply({ embeds: [embed], files: [attachment] });

    // Reactions
    await msg.react('🏦'); // Bank
    await msg.react('💸'); // Transfer
    await msg.react('⬆️'); // Withdraw
    await msg.react('⬇️'); // Deposit
    await msg.react('⬅️'); // Back

    const filter = (reaction, user) => {
      return ['⬅️', '🏦', '💸', '⬆️', '⬇️'].includes(reaction.emoji.name) && 
             user.id === message.author.id;
    };
    
    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      const userData = await getUser(user.id);

      switch (reaction.emoji.name) {
        case '⬅️':
          try {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px NotoSans';
            ctx.fillText(greeting, 20, 30);
            ctx.font = 'bold 20px NotoSans';
            ctx.fillText(user.username, 20, 55);
            
            ctx.font = '14px NotoSans';
            ctx.fillText('Total Balance', 20, 85);
            ctx.font = 'bold 32px NotoSans';
            ctx.fillText(`${userData.wallet.toLocaleString('en-US')} ₽`, 20, 125);
            
            ctx.font = '14px NotoSans';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`**** **** ${user.id.slice(-4)}`, 20, 155);
            
            const newAttachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'balance.png' });
            await msg.edit({ files: [newAttachment] });
            reaction.users.remove(user);
          } catch (error) {
            console.error('Error processing back reaction:', error);
          }
          break;

        case '🏦':
          try {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 200);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px NotoSans';
            ctx.fillText('Bank Balance', 20, 30);
            ctx.font = 'bold 20px NotoSans';
            ctx.fillText(user.username, 20, 55);
            
            ctx.font = '14px NotoSans';
            ctx.fillText('In Bank', 20, 85);
            ctx.font = 'bold 32px NotoSans';
            ctx.fillText(`${userData?.bank?.toLocaleString('en-US')} ₽`, 20, 125);
            
            ctx.font = '14px NotoSans';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`**** **** ${user.id.slice(-4)}`, 20, 155);
            
            const newAttachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'balance.png' });
            await msg.edit({ files: [newAttachment] });
            reaction.users.remove(user);
          } catch (error) {
            console.error('Error processing bank reaction:', error);
          }
          break;

        case '💸':
          const idMsg = await message.reply('**Enter the user ID to transfer to:**');
          
          const idFilter = m => m.author.id === user.id;
          const idCollector = message.channel.createMessageCollector({ 
            filter: idFilter, 
            time: 30000,
            max: 1 
          });

          idCollector.on('collect', async (idResponse) => {
            const targetId = idResponse.content;
            const member = await message.guild.members.fetch(targetId).catch(() => null);

            if (!member || member.user.bot || member.id === user.id) {
              message.reply('Invalid user ID.');
              idMsg.delete().catch(() => {});
              idResponse.delete().catch(() => {});
              return;
            }

            const amountMsg = await message.reply('**Enter the amount you want to transfer:**');
            
            const amountFilter = m => m.author.id === user.id && !isNaN(m.content);
            const amountCollector = message.channel.createMessageCollector({ 
              filter: amountFilter, 
              time: 30000,
              max: 1 
            });

            amountCollector.on('collect', async (amountResponse) => {
              const amount = parseInt(amountResponse.content);
              
              if (isNaN(amount) || amount <= 0) {
                message.reply('Invalid amount.');
                return;
              }

              const sender = await getUser(user.id);
              const receiver = await getUser(member.id);

              if (sender.wallet < amount) {
                message.reply('Insufficient funds.');
                return;
              }

              sender.wallet -= amount;
              receiver.wallet += amount;

              await updateUser(user.id, sender);
              await updateUser(member.id, receiver);

              const canvas = createCanvas(400, 200);
              const ctx = canvas.getContext('2d');

              const gradient = ctx.createLinearGradient(0, 0, 400, 200);
              gradient.addColorStop(0, '#000000');
              gradient.addColorStop(1, '#090909');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 400, 200);

              const successImage = await loadImage('./assets/utility/success.png');
              const imageSize = 64;
              ctx.drawImage(successImage, (400 - imageSize) / 2, 40, imageSize, imageSize);

              ctx.fillStyle = '#fff';
              ctx.font = 'bold 24px NotoSans';
              ctx.textAlign = 'center';
              ctx.fillText(`${amount.toLocaleString('en-US')} ₽`, 200, 140);
              
              ctx.font = '16px NotoSans';
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fillText(`ACCOUNT: **** **** ${member.id.slice(-4)}`, 200, 170);

              const transferAttachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'transfer.png' });
              const transferEmbed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('Transfer Complete')
                .setImage('attachment://transfer.png');

              // Update balance image
              const balanceCanvas = createCanvas(400, 200);
              const balanceCtx = balanceCanvas.getContext('2d');

              const balanceGradient = balanceCtx.createLinearGradient(0, 0, 400, 200);
              balanceGradient.addColorStop(0, '#000000');
              balanceGradient.addColorStop(1, '#090909');
              balanceCtx.fillStyle = balanceGradient;
              balanceCtx.fillRect(0, 0, 400, 200);

              balanceCtx.fillStyle = '#fff';
              balanceCtx.font = 'bold 16px NotoSans';
              balanceCtx.fillText(greeting, 20, 30);
              balanceCtx.font = 'bold 20px NotoSans';
              balanceCtx.fillText(message.author.username, 20, 55);
              
              balanceCtx.font = '14px NotoSans';
              balanceCtx.fillText('Total Balance', 20, 85);
              balanceCtx.font = 'bold 32px NotoSans';
              balanceCtx.fillText(`${sender.wallet.toLocaleString('en-US')} ₽`, 20, 125);
              
              balanceCtx.font = '14px NotoSans';
              balanceCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              balanceCtx.fillText(`**** **** ${message.author.id.slice(-4)}`, 20, 155);

              const balanceAttachment = new AttachmentBuilder(balanceCanvas.toBuffer(), { name: 'balance.png' });
              const balanceEmbed = EmbedBuilder.from(msg.embeds[0])
                .setImage('attachment://balance.png');

              const successMsg = await message.reply({ embeds: [transferEmbed], files: [transferAttachment] });
              await msg.edit({ embeds: [balanceEmbed], files: [balanceAttachment] });

              setTimeout(() => {
                successMsg.delete().catch(() => {});
              }, 7000);

              idMsg.delete().catch(() => {});
              amountMsg.delete().catch(() => {});
              idResponse.delete().catch(() => {});
              amountResponse.delete().catch(() => {});
            });
          });
          
          reaction.users.remove(user);
          break;
      }
    });
  }
};
