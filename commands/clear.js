const { EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'clear',
  description: 'Удалить сообщения на канале.',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const quantity = parseInt(args[args.length - 1]);
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      return message.reply('Пожалуйста, укажите количество сообщений от 1 до 100.');
    }

    const user = message.mentions.users.first();

    try {
      if (user) {
        const messages = await message.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg => msg.author.id === user.id).first(quantity);

        if (!userMessages || userMessages.length === 0) {
          return message.reply('Не найдено сообщений для удаления от этого пользователя.');
        }

        await message.channel.bulkDelete(userMessages, true);

        const embed = new EmbedBuilder()
          .setTitle('Удалено сообщений от пользователя')
          .setColor('#000000')
          .addFields(
            { name: 'Пользователь:', value: `${user.tag} \`${user.id}\``, inline: false },
            { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
            { name: 'Удалено сообщений:', value: `${userMessages.length}`, inline: false }
          )
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });

      } else {
        const messages = await message.channel.messages.fetch({ limit: quantity + 1 }); // +1 pra incluir o comando
        const filtered = messages.filter(msg => !msg.pinned && msg.id !== message.id);

        if (filtered.size === 0) {
          return message.reply('Не найдено сообщений для удаления.');
        }


        const logLines = filtered.map(msg => {
          const date = msg.createdAt.toLocaleString('ru-RU');
          return `[${date}] ${msg.author.tag} (${msg.author.id}): ${msg.content || '[Вложение/пусто]'}`;
        }).join('\n');

        const logPath = path.join(__dirname, '..', 'logs', `deleted-${Date.now()}.txt`);
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.writeFileSync(logPath, logLines);

        await message.channel.bulkDelete(filtered, true);

        const embed = new EmbedBuilder()
          .setTitle('Удалено сообщений')
          .setColor('#000000')
          .addFields(
            { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
            { name: 'Удалено сообщений:', value: `${filtered.size}`, inline: false }
          )
          .setTimestamp();

        await message.channel.send({
          embeds: [embed],
          files: [new AttachmentBuilder(logPath)]
        });


        setTimeout(() => {
          fs.unlink(logPath, err => {
            if (err) console.error('Erro ao deletar o arquivo:', err);
          });
        }, 60_000);
      }

    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке удалить сообщения.');
    }
  }
};