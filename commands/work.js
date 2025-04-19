
const { EmbedBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile, getUser, updateUser, getCooldown, setCooldown } = require('../database');

const COOLDOWN_TIME = 3600000; // 1 hora

function calculateXPReward(level) {
  if (level <= 10) return Math.floor(Math.random() * 50) + 25;
  if (level <= 30) return Math.floor(Math.random() * 100) + 50;
  if (level <= 50) return Math.floor(Math.random() * 150) + 100;
  if (level <= 100) return Math.floor(Math.random() * 300) + 150;
  return Math.floor(Math.random() * 500) + 250;
}

module.exports = {
  name: 'work',
  description: 'Trabalhe para ganhar ₽ e XP.',
  async prefixExecute(message) {
    const userId = message.author.id;
    const now = Date.now();

    const lastUsed = await getCooldown(userId, 'work');
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return message.reply(`Você precisa esperar ${minutesLeft} minutos para trabalhar novamente.`);
    }

    const userProfile = await getUserProfile(userId);
    const userData = await getUser(userId);
    if (!userProfile || !userData) {
      return message.reply('Não foi possível encontrar seu perfil. Tente novamente mais tarde.');
    }

    const moneyAmount = Math.floor(Math.random() * 1000) + 500;
    const xpAmount = calculateXPReward(userProfile.level || 0);

    // Atualizar XP
    await updateUserProfile(userId, {
      ...userProfile,
      xp: userProfile.xp + xpAmount
    });

    // Atualizar dinheiro
    await updateUser(userId, {
      ...userData,
      wallet: userData.wallet + moneyAmount
    });

    // Atualizar cooldown
    await setCooldown(userId, 'work', now);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setAuthor({ 
        name: message.author.username, 
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setDescription(`👷 Você trabalhou e recebeu:\n${moneyAmount} ₽ + ${xpAmount} de XP`);

    message.reply({ embeds: [embed] });
  }
};
