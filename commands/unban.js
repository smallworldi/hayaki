module.exports = {
  name: 'unban',
  description: 'Разблокировать пользователя по ID',

  async prefixExecute(message, args) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }

    const userId = args[0];

    if (!userId || isNaN(userId)) {
      return message.reply('Пожалуйста, укажи корректный ID пользователя. Пример: `!unban 123456789`');
    }

    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        return message.reply('Этот пользователь не находится в бане.');
      }

      await message.guild.members.unban(userId);

      const embed = {
        title: '✅ Пользователь разблокирован',
        color: 0x000000,
        fields: [
          { name: 'Пользователь', value: `${userId}`, inline: true },
          { name: 'Модератор', value: `${message.author.id}`, inline: true }
        ]
      };

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao tentar desbanir:', error);

      const errorEmbed = {
        title: '❌ Ошибка при разблокировке',
        description: 'Проверь, действительно ли пользователь забанен и есть ли у меня права.',
        color: 0x000000
      };

      message.channel.send({ embeds: [errorEmbed] });
    }
  }
};