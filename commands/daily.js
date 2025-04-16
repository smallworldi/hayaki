const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  async prefixExecute(message) {
    const user = getUser(message.author.id);
    const now = Date.now();

    if (now - user.lastDaily < 86400000) {
      const timeLeft = 86400000 - (now - user.lastDaily);
      return message.reply(`You've already claimed your daily reward. Try again in ${Math.ceil(timeLeft / 3600000)}h.`);
    }

    const amount = 500;
    user.wallet += amount;
    user.lastDaily = now;
    updateUser(message.author.id, user);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Daily Claimed')
      .setDescription(`You received ${amount} Synths.`);

    message.reply({ embeds: [embed] });
  }
};