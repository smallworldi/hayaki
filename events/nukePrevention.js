
const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { LOG_CHANNELS } = require('../config.js');

const THRESHOLD = {
  CHANNELS: { count: 3, time: 10000 }, // 3 канала за 10 секунд
  ROLES: { count: 3, time: 10000 }, // 3 роли за 10 секунд
  BANS: { count: 5, time: 10000 } // 5 банов за 10 секунд
};

const recentActions = new Map();
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: Events.GuildAuditLogEntryCreate,
  async execute(auditLogEntry, client) {
    try {
      if (!auditLogEntry || !auditLogEntry.executor || !auditLogEntry.guild) return;
      
      const { executorId, targetId, action } = auditLogEntry;
      const guild = auditLogEntry.guild;
      const actionType = getActionType(action);
      
      // Проверка белого списка перед обработкой
      if (!actionType || executorId === client?.user?.id || isWhitelisted(executorId, guild)) return;

      console.log(`Обнаружено действие: ${actionType} от ${executorId}`);
      
      if (!recentActions.has(executorId)) {
        recentActions.set(executorId, new Map());
      }
      
      const userActions = recentActions.get(executorId);
      if (!userActions.has(actionType)) {
        userActions.set(actionType, []);
      }
      
      const actions = userActions.get(actionType);
      const now = Date.now();
      actions.push(now);
      
      const threshold = THRESHOLD[actionType];
      const relevantActions = actions.filter(time => now - time < threshold.time);
      userActions.set(actionType, relevantActions);
      
      console.log(`Всего действий ${actionType}: ${relevantActions.length}`);
      
      if (relevantActions.length >= threshold.count) {
        const executor = await guild.members.fetch(executorId);
        
        // Удаление административных ролей
        const adminRoles = executor.roles.cache.filter(role => 
          role.permissions.has(PermissionsBitField.Flags.Administrator) ||
          role.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
          role.permissions.has(PermissionsBitField.Flags.ManageChannels)
        );
        
        await executor.roles.remove(adminRoles);
        
        // Лог инцидента
        const logChannel = guild.channels.cache.get(LOG_CHANNELS.moderation);
        if (logChannel) {
          await logChannel.send({
            embeds: [{
              title: '🚨 Обнаружена попытка нюка',
              description: `**Пользователь:** ${executor.tag}\n**Действие:** ${actionType}\n**Количество:** ${relevantActions.length} за ${threshold.time/1000}с`,
              color: 0xFF0000,
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Ошибка в nukePrevention:', error);
    }
  }
};

function getActionType(action) {
  switch (action) {
    case AuditLogEvent.ChannelDelete:
      return 'CHANNELS';
    case AuditLogEvent.MemberRoleUpdate:
      return 'ROLES';
    case AuditLogEvent.MemberBanAdd:
      return 'BANS';
    default:
      return null;
  }
}
