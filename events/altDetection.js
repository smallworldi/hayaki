const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const accountAgeLimit = 7 * 24 * 60 * 60 * 1000; 
    const createdAt = member.user.createdAt;
    const now = Date.now();

    const borderChannelId = '1361193318855344240'; 
    const temporaryRoleId = '1361193838151991407'; 
    const approvedRoleId = '1343021729533919434';  

    if (now - createdAt.getTime() < accountAgeLimit) {
      try {
        await member.roles.add(temporaryRoleId);

        const borderChannel = member.guild.channels.cache.get(borderChannelId);
        if (borderChannel) {
          borderChannel.send({
            embeds: [{
              title: '🚧 Подозрительная учетная запись',
              description: `Пользователь ${member} создал аккаунт недавно (${member.user.createdAt.toLocaleDateString()}).`,
              color: 0xff0000,
              footer: { text: 'Проверка новых аккаунтов' },
              timestamp: new Date()
            }]
          });
        }
      } catch (error) {
        console.error('Ошибка при назначении временной роли:', error);
      }
    } else {
      try {
        await member.roles.add(approvedRoleId);
      } catch (error) {
        console.error('Ошибка при назначении роли участника:', error);
      }
    }
  }
};
