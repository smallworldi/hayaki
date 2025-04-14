
const { SlashCommandBuilder } = require('discord.js');
const { warnings } = require('./warn.js');

module.exports = {
  name: 'warnings',
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const userWarnings = warnings.get(target.id) || [];

    if (userWarnings.length === 0) {
      return interaction.reply(`${target.tag} has no warnings.`);
    }

    const warningList = userWarnings.map((warn, index) => {
      const moderator = interaction.client.users.cache.get(warn.moderator);
      return `${index + 1}. ${warn.reason} (by ${moderator?.tag || 'Unknown'})`;
    }).join('\n');

    await interaction.reply({
      embeds: [{
        title: `Warnings for ${target.tag}`,
        description: warningList,
        color: 0xFFD700
      }]
    });
  },

  async prefixExecute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const userWarnings = warnings.get(target.id) || [];

    if (userWarnings.length === 0) {
      return message.reply(`${target.tag} has no warnings.`);
    }

    const warningList = userWarnings.map((warn, index) => {
      const moderator = message.client.users.cache.get(warn.moderator);
      return `${index + 1}. ${warn.reason} (by ${moderator?.tag || 'Unknown'})`;
    }).join('\n');

    await message.reply({
      embeds: [{
        title: `Warnings for ${target.tag}`,
        description: warningList,
        color: 0xFFD700
      }]
    });
  }
};
