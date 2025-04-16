const { EmbedBuilder } = require('discord.js');
const { getUserEconomy } = require('../database');

module.exports = {
  name: 'balance',
  description: 'Check your balance.',
  aliases: ['bal'],
  async prefixExecute(message) {
    const userId = message.author.id;
    const { wallet, bank } = await getUserEconomy(userId);

    const embed = new EmbedBuilder()
      .setTitle('Your Balance')
      .setColor('#9a46ca')
      .setDescription(`**Wallet:** ${wallet} Synths\n**Bank:** ${bank} Synths`);

    message.reply({ embeds: [embed] });
  }
};