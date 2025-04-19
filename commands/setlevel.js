const { updateUserProfile, getUserProfile, getXPLeaderboard } = require('../database');

module.exports = {
  name: 'setlevel',
  async prefixExecute(message, args) {
    // Verificar se o usuário tem permissão de administrador
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Você precisa ser um administrador para usar este comando.');
    }

    // Verificar se o ID do usuário e o nível foram fornecidos
    const userId = args[0];
    const level = parseInt(args[1]);

    if (!userId) {
      return message.reply('Por favor, forneça o ID de um usuário.');
    }

    if (isNaN(level) || level < 0) {
      return message.reply('Por favor, forneça um nível válido.');
    }

    try {
      // Obter o perfil do usuário antes de fazer qualquer alteração
      const profile = await getUserProfile(userId);
      if (!profile) {
        return message.reply('O usuário não foi encontrado no banco de dados.');
      }

      // Definir o novo nível do usuário
      const newLevel = level;

      // Calcular a meta de XP para o próximo nível
      const xpGoal = (newLevel + 1) * 500;

      // Ajustar o XP para o novo nível
      const newXP = newLevel * 500;

      // Atualizar o perfil do usuário com o novo nível e XP mantendo dados existentes
      await updateUserProfile(userId, {
        ...profile,
        level: newLevel,
        xp: newXP,
        bio: profile.bio || '',
        background: profile.background || '',
        married_with: profile.married_with || '',
        badges: profile.badges || ''
      });

      // Atualizar o ranking de level após a modificação
      const leaderboard = await getXPLeaderboard(); // Obtenha o leaderboard atualizado
      if (!leaderboard || leaderboard.length === 0) {
        return message.reply('O leaderboard está vazio ou não pode ser carregado.');
      }

      // Verificar se o usuário existe no leaderboard
      const rank = leaderboard.findIndex(user => user.user_id === userId) + 1;
      const rankMessage = rank ? `#${rank}` : '#Desconhecido';

      return message.reply(`O nível do usuário com ID ${userId} foi definido para ${newLevel}. A meta de XP foi ajustada para ${xpGoal}. O rank do usuário é ${rankMessage}.`);
    } catch (error) {
      console.error(error);
      return message.reply('Ocorreu um erro ao tentar atualizar o nível do usuário.');
    }
  }
};
