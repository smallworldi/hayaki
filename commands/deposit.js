const { EmbedBuilder } = require('discord.js');
const { getUserEconomy, updateUserEconomy } = require('../database');

module.exports = {
  name: 'deposit',
  description: 'Deposit Synths to your bank.',
  aliases: ['dep'],
  async prefixExecute(message, args) {
    const userId = message.author.id;
    const user = await getUserEconomy(userId);

    if (!args[0]) {
      return message.reply('Please specify an amount to deposit.');
    }

    const amount = args[0].toLowerCase() === 'all' ? user.wallet : parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > user.wallet) {
      return message.reply('Invalid amount or insufficient wallet balance.');
    }

    const newWallet = user.wallet - amount;
    const newBank = user.bank + amount;
    await updateUserEconomy(userId, newWallet, newBank);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Deposit Successful')
      .setDescription(`You deposited ${amount} Synths to your bank.`);

    message.reply({ embeds: [embed] });
  }
};