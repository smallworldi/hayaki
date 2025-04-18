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

    // Draw background
    const defaultBackgroundPath = path.join(__dirname, '..', 'assets', 'background', 'background.png');
    let bgImage;
    if (profile.background && profile.background.startsWith('http')) {
      try {
        bgImage = await loadImage(profile.background);
        ctx.drawImage(bgImage, 0, 0, 1024, 300);
      } catch {
        bgImage = null;
      }
    }
    if (!bgImage) {
      try {
        bgImage = await loadImage(defaultBackgroundPath);
        ctx.drawImage(bgImage, 0, 0, 1024, 300);
      } catch {
        ctx.fillStyle = '#8ad2c5';
        ctx.fillRect(0, 0, 1024, 300);
      }
    }

    // Bottom panel
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, 1024, 276);

    // Marriage badge
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
      ctx.fillText(`Casado(a): ${targetUser.username}`, 10, 322);
    }

    // User info texts
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.textAlign = 'left';

    ctx.fillText('NOME', 20, 380);
    ctx.fillText(user.username, 20, 405);

    ctx.fillText('ID', 20, 435);
    ctx.fillText(user.id, 20, 460);

    ctx.fillText('SALDO', 20, 490);
    ctx.fillText(`$${profile.wallet || 0}`, 20, 515);

    ctx.fillText('XP/META', 20, 545);
    ctx.fillText(`${profile.xp || 0}/${profile.xp_goal || '???'}`, 20, 570);

    // Dynamic level icon
    const iconSize = 100;
    const iconX = 820;
    const iconY = 360;
    const level = profile.level || 0;
    const hue = (level * 10) % 360;
    const gradient = ctx.createRadialGradient(
      iconX + iconSize/2,
      iconY + iconSize/2,
      10,
      iconX + iconSize/2,
      iconY + iconSize/2,
      iconSize/2
    );
    gradient.addColorStop(0, `hsl(${hue}, 80%, 60%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 100%, 30%)`);

    ctx.beginPath();
    ctx.arc(
      iconX + iconSize/2,
