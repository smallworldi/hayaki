const { createCanvas, loadImage } = require('canvas');
const { getUserProfile } = require('../database');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'perfil',
  aliases: ['profile'],
  async prefixExecute(message) {
    const user = message.mentions.users.first() || message.author;
const profile = await getUserProfile(user.id);

    // Cria o canvas
    const canvas = createCanvas(1024, 576);
    const ctx = canvas.getContext('2d');

    // Fundo superior personalizado ou padrão
    const bgImage = profile.background && profile.background.startsWith('http') ?
      await loadImage(profile.background).catch(() => null) : null;

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, 1024, 300);
    } else {
      ctx.fillStyle = '#8ad2c5';
      ctx.fillRect(0, 0, 1024, 300);
    }

    // Fundo inferior preto
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, 1024, 276);

    // "CASADO COM:"
    ctx.fillStyle = '#bca5ef';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(200, 300);
    ctx.lineTo(170, 330);
    ctx.lineTo(0, 330);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('CASADO COM:', 10, 322);

    // Nome do cônjuge
    if (profile.married_with) {
      ctx.font = '18px Arial';
      ctx.fillText(profile.married_with, 10, 345);
    }

    // Nome do usuário
    ctx.font = '22px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`NOME`, 20, 380);
    ctx.fillText(user.username, 20, 405);

    ctx.fillText(`ID`, 20, 435);
    ctx.fillText(user.id, 20, 460);

    ctx.fillText(`SALDO`, 20, 490);
    ctx.fillText(`$${profile.wallet || 0}`, 20, 515);

    ctx.fillText(`XP/META`, 20, 545);
    ctx.fillText(`${profile.xp}/${profile.xp_goal}`, 20, 570);

    // Level
    ctx.fillText('LEVEL', 820, 380);
    ctx.fillText(profile.level.toString(), 820, 405);

    // Ranking dinheiro (mocked por enquanto)
    ctx.fillText('RANKING DINHEIRO', 820, 440);
    ctx.fillText('#15', 820, 465);

    // Badges
    ctx.fillText('BADGES', 820, 520);
    ctx.fillText(profile.badges || 'Nenhuma', 820, 545);

    // Biografia
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px Arial';
    ctx.fillText(profile.bio || '...', 512, 565);

    // Foto de perfil (círculo)
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 300, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 412, 200, 200, 200);
    ctx.restore();

    // Enviar imagem
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./profile-card.png', buffer);
    return message.channel.send({ files: ['./profile-card.png'] });
  }
};