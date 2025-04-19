const { EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { LOG_CHANNELS } = require('../config.js');

module.exports = {
  name: 'clear',
  description: 'Удалить сообщения на канале.',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const quantity = parseInt(args[args.length - 1]);
    if (isNaN(quantity) || quantity < 1 || quantity > 1000) {
      return message.reply('Пожалуйста, укажите количество сообщений от 1 до 1000.');
    }

    try {
      let deletedMessages = [];
      let remaining = quantity;
      let lastMessageId = null;

      while (remaining > 0) {
        const fetchAmount = Math.min(remaining, 100);
        const options = { limit: fetchAmount };
        if (lastMessageId) options.before = lastMessageId;

        const fetched = await message.channel.messages.fetch(options);
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

        const filtered = fetched
          .filter(msg => !msg.pinned && msg.id !== message.id && msg.createdTimestamp > twoWeeksAgo);

        if (filtered.size === 0) break;

        const toDelete = Array.from(filtered.values());
        lastMessageId = toDelete[toDelete.length - 1]?.id;

        await message.channel.bulkDelete(toDelete, true);
        deletedMessages.push(...toDelete);
        remaining -= toDelete.length;


        await new Promise(res => setTimeout(res, 1000));
      }

      if (deletedMessages.length === 0) {
        return message.reply('Не найдено сообщений для удаления.');
      }

      const logLines = deletedMessages.map(msg => {
        const date = msg.createdAt.toLocaleString('ru-RU');
        return `[${date}] ${msg.author.tag} (${msg.author.id}): ${msg.content || '[Вложение/пусто]'}`;
      }).join('\n');

      const logPath = path.join(__dirname, '..', 'logs', `deleted-${Date.now()}.txt`);
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.writeFileSync(logPath, logLines);

      const embed = new EmbedBuilder()
        .setTitle('Удалено сообщений')
        .setColor('#000000')
        .addFields(
          { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
          { name: 'Удалено сообщений:', value: `${deletedMessages.length}`, inline: false }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      const logChannel = message.guild.channels.cache.get(LOG_CHANNELS.messages);
      if (logChannel) {
        await logChannel.send({
          embeds: [{
            title: '📜 Журнал удаленных сообщений',
            description: `**Модератор:** ${message.author.tag} \`${message.author.id}\`\n**Канал:** ${message.channel}\n**Количество:** ${deletedMessages.length}`,
            color: 0xFF0000,
            timestamp: new Date()
          }],
          files: [new AttachmentBuilder(logPath)]
        });
      }

      setTimeout(() => {
        fs.unlink(logPath, err => {
          if (err) console.error('Erro ao deletar o arquivo:', err);
        });
      }, 60_000);

    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке удалить сообщения.');
    }
  }
};