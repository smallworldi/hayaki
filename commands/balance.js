const { EmbedBuilder } = require('discord.js');
const { getUser } = require('./database');

module.exports = {
  name: 'balance',
  description: 'Check your balance.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const user = getUser(message.author.id);
    const embed = new EmbedBuilder()
      .setTitle('Your Wallet')
      .setColor('#9a46ca')
      .setDescription(`Wallet: ${user.wallet} Synths\nBank: ${user.bank} Synths`);

    message.reply({ embeds: [embed] });
  }
};