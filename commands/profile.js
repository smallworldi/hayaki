const { createCanvas, loadImage } = require('canvas');
const { getUserFullProfile, getMoneyRank } = require('../database');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'perfil',
  aliases: ['profile'],
  async prefixExecute(message) {
    const user = message.mentions.users.first() || message.author;
    const profile = await getUserFullProfile(user.id);

    const canvas = createCanvas(1024, 576);
    const ctx = canvas.getContext('2d');

    const defaultBackgroundPath = path.join(__dirname, '..', 'assets', 'background', 'background.png');
    let bgImage;

    if (profile.background && profile.background.startsWith('http')) {
      try {
        bgImage = await loadImage(profile.background);
        ctx.drawImage(bgImage, 0, 0, 1024, 300);
      } catch (error) {
        console.error('Erro ao carregar fundo personalizado:', error);
        bgImage = null;
      }
    }

    if (!bgImage) {
      try {
        bgImage = await loadImage(defaultBackgroundPath);
        ctx.drawImage(bgImage, 0, 0, 1024, 300);
      } catch (error) {
        console.error('Erro ao carregar fundo padrão:', error);
        ctx.fillStyle = '#8ad2c5';
        ctx.fillRect(0, 0, 1024, 300);
      }
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, 1024, 276);

    // Casamento
    if (profile.married_with) {
      const targetUser = await message.client.users.fetch(profile.married_with);
      ctx.fillStyle = '#bca5ef';
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.lineTo(300, 300);
      ctx.lineTo(270, 330);
      ctx.lineTo(0, 330);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`Casado(a) com: ${targetUser.username}`, 10, 322);
    }

    ctx.font = '22px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`NOME`, 20, 380);
    ctx.fillText(user.username, 20, 405);

    ctx.fillText(`ID`, 20, 435);
    ctx.fillText(user.id, 20, 460);

    ctx.fillText(`SALDO`, 20, 490);
    ctx.fillText(`$${profile.wallet || 0}`, 20, 515);

    ctx.fillText(`XP/META`, 20, 545);
    ctx.fillText(`${profile.xp || 0}/${profile.xp_goal || '???'}`, 20, 570);

    ctx.fillText('LEVEL', 820, 380);
    ctx.fillText((profile.level || 0).toString(), 820, 405);

    const moneyRank = await getMoneyRank(user.id);
    ctx.fillText('RANKING DINHEIRO', 820, 440);
    ctx.fillText(`#${moneyRank || 'Desconhecido'}`, 820, 465);

    ctx.fillText('BADGES', 820, 520);
    ctx.fillText(profile.badges || 'Nenhuma', 820, 545);

    ctx.textAlign = 'center';
    ctx.font = 'italic 20px Arial';
    ctx.fillText(profile.bio || 'Este usuário não tem uma biografia.', 512, 565);

    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 300, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 412, 200, 200, 200);
    ctx.restore();

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./profile-card.png', buffer);
    return message.channel.send({ files: ['./profile-card.png'] });
  }
};