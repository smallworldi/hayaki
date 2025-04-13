const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Удалить сообщения на канале.',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    // Caso a quantidade de mensagens seja fornecida como primeiro argumento
    const quantity = parseInt(args[args.length - 1]);

    // Verifica se a quantidade de mensagens é válida
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      return message.reply('Пожалуйста, укажите количество сообщений от 1 до 100.');
    }

    // Se houver uma menção ao usuário, pega o usuário
    const user = message.mentions.users.first();

    try {
      if (user) {
        // Exclui as mensagens de um usuário específico
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg => msg.author.id === user.id).first(quantity);

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
        // Exclui as mensagens de qualquer autor no canal
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
