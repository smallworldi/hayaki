const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'withdraw',
  description: 'Withdraw Synths from your bank.',
  aliases: ['with'],
  async prefixExecute(message, args) {
    const user = getUser(message.author.id);
    const amount = args[0] === 'all' ? user.bank : parseInt(args[0]);

    if (isNaN(amount) || amount <= 0 || amount > user.bank) {
      return message.reply('Invalid amount or insufficient bank balance.');
    }

    user.bank -= amount;
    user.wallet += amount;
    updateUser(message.author.id, user);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Withdrawal Successful')
      .setDescription(`You withdrew ${amount} Synths to your wallet.`);

    message.reply({ embeds: [embed] });
  }
};