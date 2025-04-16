const { EmbedBuilder } = require('discord.js');
const { getUserEconomy, updateUserEconomy } = require('../database');

module.exports = {
  name: 'rob',
  description: 'Attempt to rob another user.',
  async prefixExecute(message, args) {
    const target = message.mentions.members.first();
    const thief = await getUserEconomy(message.author.id);

    if (!target || target.id === message.author.id || target.user.bot) {
      return message.reply('Mention a valid user to rob.');
    }

    const victim = await getUserEconomy(target.id);

    if (victim.wallet < 100) {
      return message.reply('That user has too little money to rob.');
    }

    const success = Math.random() < 0.5;

    if (success) {
      const amount = Math.floor(Math.random() * (victim.wallet * 0.3)) + 50;
      const newThiefWallet = thief.wallet + amount;
      const newVictimWallet = victim.wallet - amount;
      
      await updateUserEconomy(message.author.id, newThiefWallet, thief.bank);
      await updateUserEconomy(target.id, newVictimWallet, victim.bank);

      const embed = new EmbedBuilder()
        .setColor('#9a46ca')
        .setTitle('Robbery Successful')
        .setDescription(`You stole ${amount} Synths from ${target.user.tag}.`);

      message.reply({ embeds: [embed] });
    } else {
      const penalty = Math.floor(thief.wallet * 0.2);
      const newThiefWallet = thief.wallet - penalty;
      
      await updateUserEconomy(message.author.id, newThiefWallet, thief.bank);

      const embed = new EmbedBuilder()
        .setColor('#9a46ca')
        .setTitle('You Got Caught')
        .setDescription(`You failed the robbery and lost ${penalty} Synths.`);

      message.reply({ embeds: [embed] });
    }
  }
};