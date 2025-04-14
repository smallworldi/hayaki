
const { SlashCommandBuilder } = require('discord.js');
const { warnings } = require('./warn.js');

module.exports = {
  name: 'clearwarns',
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to clear warnings for')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    warnings.delete(target.id);
    await interaction.reply(`Cleared all warnings for ${target.tag}.`);
  },

  async prefixExecute(message, args) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.users.first();
    if (!target) {
      return message.reply('Please mention a user to clear warnings for.');
    }

    warnings.delete(target.id);
    await message.reply(`Cleared all warnings for ${target.tag}.`);
  }
};
