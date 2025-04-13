const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'panel',
  async prefixExecute(message) {
    const member = await message.guild.members.fetch(message.author.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.reply('You need to be in a voice channel to use this command.');
    }

    if (!voiceChannel.permissionsFor(message.author).has('ManageChannels')) {
      return message.reply('You are not the owner of this channel.');
    }

    // Filter users who explicitly have CONNECT permission
    const allowedUsers = voiceChannel.permissionOverwrites.cache
      .filter(overwrite => overwrite.allow.has(PermissionsBitField.Flags.Connect) && message.guild.members.cache.has(overwrite.id))
      .map(overwrite => `<@${overwrite.id}>`);

    const whitelistText = allowedUsers.length > 0
      ? allowedUsers.join('\n')
      : '*No allowed users*';

    const embed = new EmbedBuilder()
      .setTitle('🎚️ Channel Control Panel')
      .setDescription(
        `Current channel: ${voiceChannel.name}\n` +
        `User limit: ${voiceChannel.userLimit || 'No limit'}\n\n` +
        `👥 **Allowed Users:**\n${whitelistText}`
      )
      .setColor('#000000');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`name_${voiceChannel.id}`)
        .setLabel('Change Name')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`limit_${voiceChannel.id}`)
        .setLabel('Change Limit')
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`whitelist_${voiceChannel.id}`)
        .setLabel('Allow User')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`remove_whitelist_${voiceChannel.id}`)
        .setLabel('Remove Permission')
        .setStyle(ButtonStyle.Danger)
    );

    await message.reply({ embeds: [embed], components: [row1, row2] });
  }
};
