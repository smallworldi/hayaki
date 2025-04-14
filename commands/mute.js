const { EmbedBuilder, PermissionFlagsBits, Collection } = require('discord.js');

// хранит ожидающие время mute
const waitingForDuration = new Collection();

module.exports = {
  name: 'mute',
  description: 'Временно замутить пользователя.',
  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('У вас нет прав для временного мута участников.');
    }

    const userArg = args[0];
    if (!userArg) return message.reply('Вы должны упомянуть пользователя или указать его ID.');

    const member = await message.guild.members.fetch(userArg.replace(/[<@!>]/g, '')).catch(() => null);
    if (!member) return message.reply('Пользователь не найден.');
    if (!member.moderatable) return message.reply('Я не могу замутить этого пользователя.');

    // спрашиваем продолжительность
    const promptEmbed = new EmbedBuilder()
      .setColor('#000000') // cor preta
      .setTitle('Временный мут')
      .setDescription('Укажите продолжительность мута для пользователя. Вы можете использовать следующие форматы:\n\n' +
        '`10s` - 10 секунд\n' +
        '`1m` - 1 минута\n' +
        '`10m` - 10 минут\n' +
        '`1h` - 1 час\n' +
        '`2h` - 2 часа\n' +
        '`1d` - 1 день\n' +
        '`7d` - 7 дней\n' +
        '`28d` - 28 дней (максимум)\n\n' +
        'Например: напишите "1h" для одного часа или "30m" для 30 минут.');

    const promptMsg = await message.reply({ embeds: [promptEmbed] });
    waitingForDuration.set(message.author.id, { member, promptMsg });

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async msg => {
      const durationStr = msg.content.toLowerCase();
      const ms = parseDuration(durationStr);

      if (!ms) {
        waitingForDuration.delete(message.author.id);
        return message.reply('Неверный формат. Используйте, например: `10s`, `1h`, `2d`.');
      }

      await member.timeout(ms, `Замучен модератором ${message.author.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#000000') // cor preta
        .setTitle('Пользователь замучен')
        .addFields(
          { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
          { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
          { name: 'Длительность:', value: durationStr, inline: false }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      waitingForDuration.delete(message.author.id);
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        waitingForDuration.delete(message.author.id);
        promptMsg.edit('Время ожидания истекло. Мут не выполнен.');
      }
    });
  }
};

// Функция преобразования "10s", "1m", "1h", "1d" в миллисекунды
function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}