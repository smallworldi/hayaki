
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'rank',
  async prefixExecute(message, args) {
    const voiceTimeTracker = message.client.voiceTimeTracker;

    if (!voiceTimeTracker || voiceTimeTracker.size === 0) {
      return message.reply('There are no records of time on call yet.');
    }

    let userTimes = Array.from(voiceTimeTracker.entries()).map(([userId, data]) => {
      const currentTime = data.startTime ? (Date.now() - data.startTime) : 0;
      return {
        userId,
        totalTime: (data.totalTime || 0) + currentTime
      };
    });

    userTimes = userTimes.filter(user => user.totalTime > 0);

    if (userTimes.length === 0) {
      return message.reply('There are no call time records yet.');
    }

    userTimes.sort((a, b) => b.totalTime - a.totalTime);

    const top10 = userTimes.slice(0, 10);
    let rankMessage = '**🎤 Ranking :**\n';

    for (let i = 0; i < top10.length; i++) {
      const user = await message.guild.members.fetch(top10[i].userId).catch(() => null);
      if (user) {
        rankMessage += `${i + 1}. ${user.user.username}: ${getFormattedTime(top10[i].totalTime)}\n`;
      }
    }

    message.reply(rankMessage);
  }
};

function getFormattedTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
