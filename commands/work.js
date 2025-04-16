const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

const COOLDOWN_TIME = 3600000; // 1 hour in milliseconds

module.exports = {
  name: 'work',
  description: 'Work to earn random Synths.',
  async prefixExecute(message) {
    const user = getUser(message.author.id);
    const now = Date.now();


    if (now - user.lastWork < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - user.lastWork);
      const minutesLeft = Math.ceil(timeLeft / 60000); // converte para minutos
      return message.reply(`You can only work once per hour. Try again in ${minutesLeft} minute(s).`);
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