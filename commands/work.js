const { EmbedBuilder } = require('discord.js');
const { getBalance, updateBalance, getCooldown, setCooldown } = require('../database');

const COOLDOWN_TIME = 3600000; // 1h

module.exports = {
  name: 'work',
  description: 'Work to earn random Synths.',
  async prefixExecute(message) {
    const userId = message.author.id;
    const now = Date.now();

    const lastUsed = await getCooldown(userId, 'work');
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return message.reply(`You can only work once per hour. Try again in ${minutesLeft} minute(s).`);
    }

    const amount = Math.floor(Math.random() * 400) + 100;
    const currentBalance = await getBalance(userId);
    await updateBalance(userId, currentBalance + amount);
    await setCooldown(userId, 'work', now);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('You Worked')
      .setDescription(`You earned ${amount} Synths.`);

    message.reply({ embeds: [embed] });
  }
};