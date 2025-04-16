const { createCanvas, loadImage } = require('canvas');
const { getUserProfile, getXPLeaderboard } = require('../database');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
  name: 'perfil',
  description: 'Exibe o perfil do usuário em forma de card de imagem.',
  async execute(message) {
    const userId = message.author.id;
    const guildId = message.guild.id;

    // Obtém o perfil do usuário
    const userProfile = await getUserProfile(userId);

    // Obtém o ranking de XP no servidor
    const leaderboard = await getXPLeaderboard(guildId);
    const userRank = leaderboard.findIndex(entry => entry.user_id === userId) + 1 || 'N/A';

    // Calcula a meta XP (nível baseado em XP)
    const nextLevelXP = (userProfile.level * 1000); // Exemplo de cálculo de meta XP (ex.: 1000 XP por nível)

    // Criar a imagem do card
    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#2b2d31'; // Fundo escuro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Carregar fundo personalizado
    if (userProfile.background) {
      const backgroundImage = await loadImage(userProfile.background);
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    let avatarURL = message.author.displayAvatarURL({ extension: 'png', size: 256 });

try {
  const avatar = await loadImage(avatarURL);
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 100, 50, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 50, 50, 100, 100);
  ctx.restore();
} catch (err) {
  console.error('Erro ao carregar avatar:', err);
}

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px sans-serif';
    ctx.fillText(message.author.username, 160, 80); // Nome de usuário

    ctx.font = '20px sans-serif';
    ctx.fillText(`ID: ${message.author.id}`, 160, 120);
    ctx.fillText(`Ranking de XP: #${userRank}`, 160, 160);
    ctx.fillText(`XP Atual: ${userProfile.xp} / ${nextLevelXP}`, 160, 200);
    ctx.fillText(`Meta XP: ${nextLevelXP} XP`, 160, 240);

    ctx.font = '18px sans-serif';
    ctx.fillText('Biografia:', 160, 280);
    ctx.fillText(userProfile.bio || 'Sem biografia definida.', 160, 310);

    // Gerar o buffer da imagem
    const buffer = canvas.toBuffer('image/png');

    // Criar o anexo com a imagem
    const attachment = new AttachmentBuilder(buffer, { name: 'perfil-card.png' });

    // Enviar a imagem do card como resposta
    message.reply({ files: [attachment] });
  }
};