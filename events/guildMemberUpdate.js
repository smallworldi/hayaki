
const { AuditLogEvent, PermissionsBitField } = require('discord.js');

const thresholds = {
  ROLE_REMOVE: { count: 3, time: 10000 },
};

const roleRemovalTracker = new Map();

async function trackRoleRemoval(guild, executorId) {
  const now = Date.now();

  if (!roleRemovalTracker.has(executorId)) {
    roleRemovalTracker.set(executorId, []);
  }

  const timestamps = roleRemovalTracker.get(executorId);
  timestamps.push(now);

  // Сохраняем только события за последние 10 секунд
  const validTimestamps = timestamps.filter(ts => now - ts < thresholds.ROLE_REMOVE.time);
  roleRemovalTracker.set(executorId, validTimestamps);

  return validTimestamps.length >= thresholds.ROLE_REMOVE.count;
}

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    try {
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      // Проверяем, была ли УДАЛЕНА роль
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
      if (removedRoles.size === 0) return;

      const fetchedLogs = await newMember.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberRoleUpdate,
        limit: 5,
      });

      const now = Date.now();
      const entry = fetchedLogs.entries.find(e =>
        e.target.id === newMember.id &&
        now - e.createdTimestamp < 5000 &&
        e.executor &&
        e.changes.some(change => change.key === '$remove' || change.key === 'roles')
      );

      if (!entry) return;

      const executorId = entry.executor.id;
      const executor = await newMember.guild.members.fetch(executorId);

      const { isWhitelisted } = require('../utils/whitelist');
      if (executor.user.bot || isWhitelisted(executor.id, newMember.guild)) return;

      const logChannel = newMember.guild.channels.cache.get('1361137721275584528');

      // Лог для каждого обнаруженного удаления
      if (logChannel) {
        logChannel.send({
          embeds: [{
            title: '🔍 Обнаружено удаление роли',
            description: `**Исполнитель:** ${executor.user.tag} (${executor.id})\n**Цель:** ${newMember.user.tag} (${newMember.id})\n**Удаленные роли:** ${removedRoles.map(r => r.name).join(', ')}`,
            color: 0xFFA500,
            timestamp: new Date()
          }]
        });
      }

      // Проверка на массовое действие
      const isMass = await trackRoleRemoval(newMember.guild, executorId);
      if (isMass) {
        // Удаляем административные роли у исполнителя
        const rolesToRemove = executor.roles.cache.filter(role =>
          role.permissions.has(PermissionsBitField.Flags.Administrator) ||
          role.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
          role.permissions.has(PermissionsBitField.Flags.ManageChannels) ||
          role.permissions.has(PermissionsBitField.Flags.BanMembers)
        );

        await executor.roles.remove(rolesToRemove);

        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🚨 Обнаружено массовое удаление ролей!',
              description: `**Исполнитель:** ${executor.user.tag} (${executor.id}) был наказан за массовое удаление ролей у участников.`,
              color: 0xFF0000,
              timestamp: new Date()
            }]
          });
        }
      }

    } catch (err) {
      console.error('Ошибка в guildMemberUpdate:', err);
    }
  }
};
