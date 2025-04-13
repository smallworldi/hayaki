module.exports = {
  name: 'clear',
  description: 'Удалить сообщения на канале.',
  async execute(message, args) {
    try {
      if (!message.member.permissions.has('MANAGE_MESSAGES')) {
        return message.reply('У вас нет прав для использования этой команды.');
      }

      const quantity = parseInt(args[0]);

      if (isNaN(quantity) || quantity < 1 || quantity > 100) {
        return message.reply('Пожалуйста, укажите количество сообщений от 1 до 100.');
      }

      const user = message.mentions.users.first();

      if (user) {
        const messages = await message.channel.messages.fetch({ limit: quantity });
        const userMessages = messages.filter(msg => msg.author.id === user.id);

        if (userMessages.size === 0) {
          return message.reply(`Не найдено сообщений от ${user.tag}.`);
        }

        await message.channel.bulkDelete(userMessages, true);
        message.channel.send(`Удалено ${userMessages.size} сообщений от ${user.tag}.`);
      } else {
        const messages = await message.channel.messages.fetch({ limit: quantity });

        if (messages.size === 0) {
          return message.reply('Не найдено сообщений для удаления.');
        }

        await message.channel.bulkDelete(messages, true);
        message.channel.send(`Удалено ${messages.size} сообщений.`);
      }
    } catch (error) {
      console.error(error);
      message.reply('Произошла ошибка при попытке удалить сообщения.');
    }
  }
};
