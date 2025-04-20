module.exports = {
  name: 'addreactions',
  description: 'Добавляет кастомные реакции к embed-сообщению.',

  async prefixExecute(message, args, client) {
    const ownerId = '1032510101753446421';
    if (message.author.id !== ownerId) {
      return message.reply('❌ У вас нет прав использовать эту команду.');
    }

    const messageId = args[0];
    const канал = message.mentions.channels.first() || message.channel;

    if (!messageId) {
      return message.reply('❗ Вы должны указать ID сообщения.');
    }

    if (isNaN(messageId)) {
      return message.reply('❗ ID сообщения должно быть числом.');
    }

    // Кастомные эмодзи
    const эмодзи = [
      '<:SCs2:1363604624011165867>',
      '<:SDota2:1363604586056782017>',
      '<:SValorant:1363604538397032660>',
      '<:SLoL:1363604498987090211>',
      '<:SNews:1363604418347536465>',
      '<:SNews:1363604464409383053>',
    ];

    try {
      const целевоеСообщение = await канал.messages.fetch(messageId);

      if (!целевоеСообщение) {
        return message.reply('❌ Сообщение с таким ID не найдено.');
      }

      // Verificar se o bot tem permissão para reagir no canal
      if (!канал.permissionsFor(client.user).has('ADD_REACTIONS')) {
        return message.reply('❌ У меня нет прав на добавление реакций в этом канале.');
      }

      for (const emoji of эмодзи) {
        try {
          await целевоеСообщение.react(emoji);
        } catch (err) {
          console.error(`Erro ao adicionar emoji ${emoji}: ${err}`);
          message.reply(`❌ Произошла ошибка при добавлении реакции ${emoji}.`);
        }
      }

      message.reply(`✅ Реакции успешно добавлены к сообщению с ID ${messageId}!`);
    } catch (err) {
      console.error(err);
      // Melhor tratamento de erro, explicando o possível problema
      if (err.message.includes("Unknown Message")) {
        message.reply('❌ Сообщение с таким ID не найдено. Проверьте правильность ID.');
      } else {
        message.reply('❌ Произошла ошибка при добавлении реакций.');
      }
    }
  },
};
