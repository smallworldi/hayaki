
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

    const spouseId = profile.married_with;
    let spouseUser;
    
    try {
      spouseUser = await message.client.users.fetch(spouseId);
    } catch (error) {
      spouseUser = null;
    }

    const authorProfile = await getUserFullProfile(message.author.id);
    const spouseProfile = await getUserFullProfile(spouseId);

    await updateUserProfile(message.author.id, {
      ...authorProfile,
      married_with: null
    });
    
    await updateUserProfile(spouseId, {
      ...spouseProfile,
      married_with: null
    });

    const divorceEmbed = new EmbedBuilder()
      .setTitle('Divórcio realizado')
      .setDescription(`${message.author.tag} se divorciou de ${spouseUser ? spouseUser.tag : 'Unknown User'}.`)
      .setColor('#ff0000')
      .setTimestamp();

    message.channel.send({ embeds: [divorceEmbed] });
  }
};
