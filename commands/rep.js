
const { EmbedBuilder } = require('discord.js');
const { getUserReps, addRep, getCooldown, setCooldown } = require('../database');

const COOLDOWN_TIME = 1800000; // 30 minutes

module.exports = {
  name: 'rep',
  async prefixExecute(message, args) {
    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Por favor, mencione um usuário para dar reputação.');
    }

    if (target.id === message.author.id) {
      return message.reply('Você não pode dar reputação para si mesmo.');
    }

    const now = Date.now();
    const lastUsed = await getCooldown(message.author.id, 'rep');
    
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return message.reply(`Você precisa esperar ${minutesLeft} minutos para dar reputação novamente.`);
    }

    const newReps = await addRep(target.id);
    await setCooldown(message.author.id, 'rep', now);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setDescription(`**${message.author.username}** você deu uma reputação para **${target.username}**!\nagora **${target.username}** tem **${newReps}** reps!`);

    message.reply({ embeds: [embed] });
  }
};
