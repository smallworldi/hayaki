const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Забанить пользователя',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Пожалуйста, укажите пользователя для бана.');
    }

    if (!member.bannable) {
      return message.reply('Я не могу забанить этого пользователя.');
    }

    try {
      await member.ban();
      const embed = new EmbedBuilder()
        .setTitle('Пользователь забанен')
        .setColor('#000000')
        .addFields(
          { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
          { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке забанить пользователя.');
    }
  }
};