const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'deposit',
  description: 'Deposit Synths to your bank.',
  aliases: ['dep'],
  async prefixExecute(message, args) {
    const user = await getUser(message.author.id);
    const amount = args[0] === 'all' ? user.wallet : parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > user.wallet) {
      return message.reply('Invalid amount or insufficient wallet balance.');
    }


    user.wallet -= amount;
    user.bank += amount;
    await updateUser(message.author.id, user);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Deposit Successful')
      .setDescription(`You deposited ${amount} Synths to your bank.`);

    message.reply({ embeds: [embed] });
  }
};