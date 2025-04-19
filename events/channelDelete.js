
const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { LOG_CHANNELS } = require('../config.js');
const { isWhitelisted } = require('../utils/whitelist');

const DELETION_THRESHOLD = 3;
const TIME_WINDOW = 10000;
const recentChannelDeletions = new Map();

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel, client) {
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete
      });

      const deletionLog = auditLogs.entries.first();
      if (!deletionLog) return;

      const { executor } = deletionLog;
      if (!executor || executor.id === client?.user?.id) return;

      // Проверка белого списка перед обработкой
      if (isWhitelisted(executor.id, channel.guild)) {
        console.log(`Канал удален пользователем ${executor.tag} (Пользователь в белом списке)`);
        return;
      }

      const now = Date.now();
      if (!recentChannelDeletions.has(executor.id)) {
        recentChannelDeletions.set(executor.id, []);
      }

      const deletions = recentChannelDeletions.get(executor.id);
      deletions.push(now);

      const recentDeletions = deletions.filter(time => now - time < TIME_WINDOW);
      recentChannelDeletions.set(executor.id, recentDeletions);

      console.log(`Канал удален пользователем ${executor.tag}. Всего удалений: ${recentDeletions.length}`);

      if (recentDeletions.length >= DELETION_THRESHOLD) {
        const member = await channel.guild.members.fetch(executor.id);
        
        const rolesToRemove = member.roles.cache.filter(role =>
          role.permissions.has(PermissionsBitField.Flags.Administrator) ||
          role.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
          role.permissions.has(PermissionsBitField.Flags.ManageChannels)
        );

        await member.roles.remove(rolesToRemove);

        const logChannel = channel.guild.channels.cache.get(LOG_CHANNELS.moderation);
        if (logChannel) {
          await logChannel.send({
            embeds: [{
              title: '🚨 Система Анти-Нюк',
              description: `**Пользователь:** ${executor.tag}\n**Действие:** Удалил ${DELETION_THRESHOLD} каналов за ${TIME_WINDOW/1000} секунд\n**Наказание:** Административные роли удалены`,
              color: 0xFF0000,
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Ошибка в channelDelete:', error);
    }
  }
};
