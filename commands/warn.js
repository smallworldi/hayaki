
const { SlashCommandBuilder } = require('discord.js');

const warnings = new Map();

module.exports = {
  warnings,
  name: 'warn',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const member = await interaction.guild.members.fetch(target.id);

    if (!warnings.has(target.id)) {
      warnings.set(target.id, []);
    }

    warnings.get(target.id).push({
      reason,
      timestamp: Date.now(),
      moderator: interaction.user.id
    });

    const warningCount = warnings.get(target.id).length;

    let action = '';
    if (warningCount >= 7) {
      await member.ban({ reason: `Reached 7 warnings: ${reason}` });
      action = 'banned';
    } else if (warningCount >= 5) {
      await member.kick(`Reached 5 warnings: ${reason}`);
      action = 'kicked';
    } else if (warningCount >= 3) {
      await member.timeout(24 * 60 * 60 * 1000, `Reached 3 warnings: ${reason}`);
      action = 'muted for 24 hours';
    }

    const logChannel = interaction.guild.channels.cache.get('YOUR_LOG_CHANNEL_ID');
    if (logChannel) {
      await logChannel.send({
        embeds: [{
          title: '⚠️ Warning Issued',
          description: `**User:** ${target.tag}\n**Reason:** ${reason}\n**Warning Count:** ${warningCount}\n**Action Taken:** ${action || 'None'}`,
          color: 0xFFD700
        }]
      });
    }

    await interaction.reply(`Warned ${target.tag} for: ${reason}. This is warning #${warningCount}.${action ? ` User has been ${action}.` : ''}`);
  },

  async prefixExecute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Please mention a user to warn.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const member = await message.guild.members.fetch(target.id);

    if (!warnings.has(target.id)) {
      warnings.set(target.id, []);
    }

    warnings.get(target.id).push({
      reason,
      timestamp: Date.now(),
      moderator: message.author.id
    });

    const warningCount = warnings.get(target.id).length;

    let action = '';
    if (warningCount >= 7) {
      await member.ban({ reason: `Reached 7 warnings: ${reason}` });
      action = 'banned';
    } else if (warningCount >= 5) {
      await member.kick(`Reached 5 warnings: ${reason}`);
      action = 'kicked';
    } else if (warningCount >= 3) {
      await member.timeout(24 * 60 * 60 * 1000, `Reached 3 warnings: ${reason}`);
      action = 'muted for 24 hours';
    }

    const logChannel = message.guild.channels.cache.get('YOUR_LOG_CHANNEL_ID');
    if (logChannel) {
      await logChannel.send({
        embeds: [{
          title: '⚠️ Warning Issued',
          description: `**User:** ${target.tag}\n**Reason:** ${reason}\n**Warning Count:** ${warningCount}\n**Action Taken:** ${action || 'None'}`,
          color: 0xFFD700
        }]
      });
    }

    await message.reply(`Warned ${target.tag} for: ${reason}. This is warning #${warningCount}.${action ? ` User has been ${action}.` : ''}`);
  }
};
