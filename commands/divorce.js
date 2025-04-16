const { getUserFullProfile, updateUserProfile } = require('../database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'divorce',
  aliases: ['divorciar'],
  async prefixExecute(message) {
    const profile = await getUserFullProfile(message.author.id);
    if (!profile.married_with) {
      return message.reply('Você não está casado(a) com ninguém.');
    }

    const spouseName = profile.married_with;


    const spouseUser = message.guild.members.cache.find(
      member => member.user.username === spouseName
    );


    await updateUserProfile(message.author.id, { married_with: null });

    if (spouseUser) {
      await updateUserProfile(spouseUser.user.id, { married_with: null });
    }

    const divorceEmbed = new EmbedBuilder()
      .setTitle('Divórcio realizado')
      .setDescription(`${message.author.username} se divorciou de ${spouseName}.`)
      .setColor('#ff0000')
      .setTimestamp();

    message.channel.send({ embeds: [divorceEmbed] });
  }
};