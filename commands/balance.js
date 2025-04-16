const { EmbedBuilder } = require('discord.js');
const { getBalance } = require('../database');

module.exports = {
  name: 'balance',
  description: 'Check your balance.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const userId = message.author.id;
    const user = await getBalance(userId);

    const embed = new EmbedBuilder()
      .setTitle('Your Wallet')
      .setColor('#9a46ca')
      .setDescription(`Wallet: ${user.wallet} Synths\nBank: ${user.bank} Synths`);

    message.reply({ embeds: [embed] });
  }
};