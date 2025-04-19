
const { EmbedBuilder } = require('discord.js');
const { getUser, updateUser } = require('../database');

module.exports = {
  name: 'removesynths',
  description: 'Remove Synths from a user (Admin only)',
  async prefixExecute(message, args) {
    const { isDeveloper } = require('../utils/developers');
    if (!isDeveloper(message.author.id)) {
      return message.reply('Apenas desenvolvedores podem usar este comando.');
    }

    const target = message.mentions.members.first();
    const amount = parseInt(args[1]);

    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('Please mention a user and specify a valid amount.');
    }

    const userData = await getUser(target.id);
    if (userData.wallet < amount) {
      return message.reply('User does not have enough Synths in their wallet.');
    }

    await updateUser(target.id, {
      wallet: userData.wallet - amount,
      bank: userData.bank
    });

    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Synths Removed')
      .setDescription(`Removed ${amount} Synths from ${target.user.tag}'s wallet.`);

    message.reply({ embeds: [embed] });
  }
};
