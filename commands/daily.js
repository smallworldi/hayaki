const { EmbedBuilder } = require('discord.js');
const {
  getUser,
  updateUser,
  getCooldown,
  setCooldown,
  getUserProfile,
  updateUserProfile
} = require('../database');

const COOLDOWN_TIME = 86400000; // 24h em milissegundos

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward.',
  async prefixExecute(message) {
    const userId = message.author.id;
    const now = Date.now();

    const lastUsed = await getCooldown(userId, 'daily');
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);
      const hoursLeft = Math.ceil(timeLeft / 3600000);
      return message.reply(`You've already claimed your daily reward. Try again in ${hoursLeft} hour(s).`);
    }

    const amount = 500;
    const userData = await getUser(userId);
    const newWallet = userData.wallet + amount;

    await updateUser(userId, { wallet: newWallet, bank: userData.bank });
    await setCooldown(userId, 'daily', now);

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Daily Claimed')
      .setDescription(`You received ${amount} Synths.`);

    // Add small XP reward
    const xpGain = Math.floor(Math.random() * 40) + 20;
    const userProfile = await getUserProfile(userId);
    await updateUserProfile(userId, {
      ...userProfile,
      xp: userProfile.xp + xpGain
    });
    message.reply({ embeds: [embed] });
  }
};