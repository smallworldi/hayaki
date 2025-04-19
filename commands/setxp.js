
const { updateUserProfile, getUserProfile } = require('../database');

module.exports = {
  name: 'setxp',
  async prefixExecute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Você precisa ser um administrador para usar este comando.');
    }

    const target = message.mentions.users.first();
    const xp = parseInt(args[1]);

    if (!target || isNaN(xp)) {
      return message.reply('Use: !setxp @usuário quantidade');
    }

    // Obter perfil atual
    const profile = await getUserProfile(target.id);
    
    // Adicionar novo XP ao XP existente
    const newXP = (profile.xp || 0) + xp;

    // Atualizar perfil mantendo todos os dados existentes
    await updateUserProfile(target.id, {
      ...profile,
      xp: newXP,
      level: profile.level || 0,
      bio: profile.bio || '',
      background: profile.background || '',
      married_with: profile.married_with || '',
      badges: profile.badges || ''
    });

    return message.reply(`${xp} XP foi adicionado para ${target.tag}. XP total: ${newXP}`);
  }
};
