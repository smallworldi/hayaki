
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'lock',
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel or all channels')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to lock (leave empty for current channel)')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    });

    await interaction.reply(`🔒 Locked ${channel}`);
  },

  async prefixExecute(message, args) {
    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('You do not have permission to use this command.');
    }

    if (args[0] === 'all') {
      const channels = message.guild.channels.cache.filter(c => c.type === 0);
      for (const [, channel] of channels) {
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: false
        });
      }
      return message.reply('🔒 Locked all text channels');
    }

    const channel = message.mentions.channels.first() || message.channel;
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    });
    await message.reply(`🔒 Locked ${channel}`);
  }
};
