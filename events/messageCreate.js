
const { Events, PermissionsBitField } = require('discord.js');
const { getLanguageButtons } = require('../utils.js');

const recentMessages = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot) return;

    // Your existing message handling code here
    const userId = message.author.id;
    const now = Date.now();
    
    // Rest of your message event code...
  }
};
