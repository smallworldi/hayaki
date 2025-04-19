
const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Auto-role on join
    const roleId = ''; // Add your default role ID here
    if (roleId) {
      try {
        await member.roles.add(roleId);
      } catch (error) {
        console.error('Failed to assign role:', error);
      }
    }

    // Time-based role (24 hours)
    const timeRoleId = ''; // Add your time-based role ID here
    if (timeRoleId) {
      setTimeout(async () => {
        try {
          await member.roles.add(timeRoleId);
        } catch (error) {
          console.error('Failed to assign time-based role:', error);
        }
      }, 24 * 60 * 60 * 1000);
    }
  }
};
