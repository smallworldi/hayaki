
const { EmbedBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile, getCooldown, setCooldown } = require('../database');

const COOLDOWN_TIME = 3600000; // 1 hora

module.exports = {
  name: 'work',
  description: 'Trabalhe para ganhar XP aleatório.',
  async prefixExecute(message) {
    const userId = message.author.id;
    const now = Date.now();

    // Verificar o tempo do cooldown
    const lastUsed = await getCooldown(userId, 'work');
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return message.reply(`Você só pode trabalhar uma vez por hora. Tente novamente em ${minutesLeft} minuto(s).`);
    }

    // Gerar XP aleatório (exemplo: entre 25 e 75 XP)
    const xpAmount = Math.floor(Math.random() * 50) + 25;

    // Obter o perfil do usuário
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return message.reply('Não consegui encontrar o seu perfil de usuário. Tente novamente mais tarde.');
    }

    // Atualizar o XP do usuário mantendo os outros dados do perfil
    await updateUserProfile(userId, {
      ...userProfile,
      xp: userProfile.xp + xpAmount,
      bio: userProfile.bio || '',
      background: userProfile.background || '',
      married_with: userProfile.married_with || '',
      badges: userProfile.badges || '',
      level: userProfile.level || 0
    });

    // Atualizando o tempo do cooldown
    await setCooldown(userId, 'work', now);

    // Criar o embed de resposta
    const embed = new EmbedBuilder()
      .setColor('#9a46ca')
      .setTitle('Você Trabalhou!')
      .setDescription(`Você ganhou ${xpAmount} XP. Seu total de XP agora é ${userProfile.xp + xpAmount}.`);

    // Enviar a resposta para o usuário
    message.reply({ embeds: [embed] });
  }
};
