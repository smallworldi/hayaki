
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Удалить сообщения на канале.',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const quantity = parseInt(args[0]);

    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      return message.reply('Пожалуйста, укажите количество сообщений от 1 до 100.');
    }

    const user = message.mentions.users.first();

    try {
      if (user) {
        const messages = await message.channel.messages.fetch({ limit: quantity });
        const userMessages = messages.filter(msg => msg.author.id === user.id);

        if (userMessages.size === 0) {
          return message.reply('Не найдено сообщений для удаления от этого пользователя.');
        }

        await message.channel.bulkDelete(userMessages, true);
        const embed = new EmbedBuilder()
          .setTitle('Удалено сообщений от пользователя')
          .setColor('#000000')
          .addFields(
            { name: 'Пользователь:', value: `${user.tag} \`${user.id}\``, inline: false },
            { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
            { name: 'Удалено сообщений:', value: `${userMessages.size}`, inline: false }
          )
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });
      } else {
        const messages = await message.channel.messages.fetch({ limit: quantity });

        if (messages.size === 0) {
          return message.reply('Не найдено сообщений для удаления.');
        }

        await message.channel.bulkDelete(messages, true);
        const embed = new EmbedBuilder()
          .setTitle('Удалено сообщений')
          .setColor('#000000')
          .addFields(
            { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
            { name: 'Удалено сообщений:', value: `${messages.size}`, inline: false }
          )
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке удалить сообщения.');
    }
  }
};
