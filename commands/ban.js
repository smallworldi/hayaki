const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Забанить пользователя')
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Укажите пользователя для бана')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('причина')
        .setDescription('Причина бана')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  name: 'ban',
  description: 'Забанить пользователя',

  async execute(interaction) {
    const member = interaction.options.getMember('пользователь');
    const reason = interaction.options.getString('причина') || 'Не указано';

    if (!member.bannable) {
      return interaction.reply({ content: 'Я не могу забанить этого пользователя.', ephemeral: true });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: 'Вы не можете забанить пользователя с равной или более высокой ролью.', ephemeral: true });
    }

    try {
      await member.ban({ reason });

      const embed = new EmbedBuilder()
        .setTitle('Пользователь забанен')
        .setColor('#000000')
        .addFields(
          { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
          { name: 'Модератор:', value: `${interaction.user.tag} \`${interaction.user.id}\``, inline: false },
          { name: 'Причина:', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      const logChannel = interaction.guild.channels.cache.get('1344024905250771005');
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Произошла ошибка при попытке забанить пользователя.', ephemeral: true });
    }
  },

  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Пожалуйста, укажите пользователя для бана.');
    }

    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('Вы не можете забанить пользователя с равной или более высокой ролью.');
    }

    if (!member.bannable) {
      return message.reply('Я не могу забанить этого пользователя.');
    }

    const reason = args.slice(1).join(' ') || 'Не указано';

    try {
      await member.ban({ reason });

      const embed = new EmbedBuilder()
        .setTitle('Пользователь забанен')
        .setColor('#000000')
        .addFields(
          { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
          { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
          { name: 'Причина:', value: reason, inline: false }
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      const logChannel = message.guild.channels.cache.get('1344024905250771005');
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }

    } catch (err) {
      console.error(err);
      return message.reply('Произошла ошибка при попытке забанить пользователя.');
    }
  }
};
