const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Банит пользователя с сервера.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('пользователь')
        .setDescription('Пользователь для бана')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('причина')
        .setDescription('Причина бана')
        .setRequired(false)),

  // Slash-команда (ban real)
  async execute(interaction) {
    const target = interaction.options.getUser('пользователь');
    const reason = interaction.options.getString('причина') || '**не указана**';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: 'Не удалось найти пользователя на сервере.', ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: 'Я не могу забанить этого пользователя.', ephemeral: true });
    }

    await member.ban({ reason }).catch(err => {
      return interaction.reply({ content: 'Произошла ошибка при попытке забанить пользователя.', ephemeral: true });
    });

    const embed = new EmbedBuilder()
      .setTitle('Пользователь забанен')
      .setColor('Red')
      .addFields(
        { name: 'Пользователь:', value: `${target.tag} \`${target.id}\``, inline: false },
        { name: 'Модератор:', value: `${interaction.user.tag} \`${interaction.user.id}\``, inline: false },
        { name: 'Причина:', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  // Префикс-команда (!ban) — ban real
  async prefixExecute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('У вас нет прав для использования этой команды.');
    }

    const userArg = args[0];
    const reason = args.slice(1).join(' ') || '**не указана**';

    if (!userArg) return message.reply('Вы должны упомянуть пользователя или указать его ID.');

    let member;
    try {
      member = await message.guild.members.fetch(userArg.replace(/[<@!>]/g, '')).catch(() => null);
    } catch {
      return message.reply('Не удалось найти пользователя.');
    }

    if (!member) return message.reply('Пользователь не найден.');
    if (!member.bannable) return message.reply('Я не могу забанить этого пользователя.');

    await member.ban({ reason }).catch(() => {
      return message.reply('Произошла ошибка при попытке забанить пользователя.');
    });

    const embed = new EmbedBuilder()
      .setTitle('Пользователь забанен')
      .setColor('Red')
      .addFields(
        { name: 'Пользователь:', value: `${member.user.tag} \`${member.user.id}\``, inline: false },
        { name: 'Модератор:', value: `${message.author.tag} \`${message.author.id}\``, inline: false },
        { name: 'Причина:', value: reason, inline: false }
      )
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};