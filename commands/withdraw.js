const { EmbedBuilder } = require('discord.js');
const { getUserEconomy, updateUserEconomy } = require('../database');

module.exports = {
  name: 'withdraw',
  description: 'Withdraw Synths from your bank.',
  aliases: ['with'],
  async prefixExecute(message, args) {
    const userId = message.author.id;
    const user = await getUserEconomy(userId);

    if (!args[0]) {
      return message.reply('Please specify an amount to withdraw.');
    }

    const amount = args[0].toLowerCase() === 'all' ? user.bank : parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > user.bank) {
      return message.reply('Invalid amount or insufficient bank balance.');
    }

    const newWallet = user.wallet + amount;
    const newBank = user.bank - amount;
    await updateUserEconomy(userId, newWallet, newBank);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Withdrawal Successful')
      .setDescription(`You withdrew ${amount} Synths to your wallet.`);

    message.reply({ embeds: [embed] });
  }
};