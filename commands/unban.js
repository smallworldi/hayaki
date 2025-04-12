module.exports = {
  name: 'unban',
  description: 'Разблокировать пользователя по ID',
  async execute(message, args) {
    // Verifica se o autor tem permissão
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('У тебя нет прав на использование этой команды.');
    }

    const userId = args[0];

    if (!userId || isNaN(userId)) {
      return message.reply('Пожалуйста, укажи корректный ID пользователя. Пример: `!unban 123456789`');
    }

    try {
      await message.guild.members.unban(userId);

      const embed = {
        title: '✅ Пользователь разблокирован',
        color: 0x000000, // Preto
        fields: [
          {
            name: 'Пользователь',
            value: `${userId}`,
            inline: true,
          },
          {
            name: 'Модератор',
            value: `${message.author.id}`,
            inline: true,
          },
        ],
      };

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      const errorEmbed = {
        title: '❌ Ошибка при разблокировке',
        description: 'Проверь, действительно ли пользователь забанен и есть ли у меня права.',
        color: 0x000000,
      };

      message.channel.send({ embeds: [errorEmbed] });
    }
  }
};