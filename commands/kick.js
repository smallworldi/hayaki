
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Выгнать пользователя с сервера',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Пожалуйста, укажите пользователя для кика.');
    }

    if (!member.kickable) {
      return message.reply('Я не могу выгнать этого пользователя.');
    }

    try {
      await member.kick();
      const embed = new EmbedBuilder()
        .setTitle('Пользователь выгнан')
        .setColor('#000000')
        .addFields(
          { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
          { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке выгнать пользователя.');
    }
  }
};
