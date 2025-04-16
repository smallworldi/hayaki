const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'work',
  description: 'Work to earn random Synths.',
  async prefixExecute(message) {
    const user = getUser(message.author.id);
    const now = Date.now();

    if (now - user.lastWork < 3600000) {
      const timeLeft = 3600000 - (now - user.lastWork);
      return message.reply(`You can only work once per hour. Try again in ${Math.ceil(timeLeft / 60000)} minutes.`);
    }

    const amount = Math.floor(Math.random() * 400) + 100;
    user.wallet += amount;
    user.lastWork = now;
    updateUser(message.author.id, user);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('You Worked')
      .setDescription(`You earned ${amount} Synths.`);

    message.reply({ embeds: [embed] });
  }
};