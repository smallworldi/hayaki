const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'pay',
  description: 'Pay another user Synths.',
  async prefixExecute(message, args) {
    const member = message.mentions.members.first();
    const amount = parseInt(args[1]);

    if (!member || member.user.bot || member.id === message.author.id) {
      return message.reply('Mention a valid user to pay.');
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply('Enter a valid amount.');
    }

    const sender = await getUser(message.author.id);
    const receiver = await getUser(member.id);

    if (sender.wallet < amount) {
      return message.reply('You do not have enough funds.');
    }

    sender.wallet -= amount;
    receiver.wallet += amount;

    await updateUser(message.author.id, sender);
    await updateUser(member.id, receiver);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Payment Sent')
      .setDescription(`You paid ${member.user.tag} ${amount} Synths.`);

    message.reply({ embeds: [embed] });
  }
};