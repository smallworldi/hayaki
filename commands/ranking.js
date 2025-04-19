
const { createCanvas, loadImage } = require('canvas');
const { getXPLeaderboard, getUserProfile } = require('../database');
const { createLevelBadge } = require('../utils/badges');
const path = require('path');

module.exports = {
  name: 'ranking',
  async execute(message, args) {
    const leaderboard = await getXPLeaderboard();
    const sortedUsers = leaderboard
      .sort((a, b) => {
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.xp - a.xp;
      });

    // Console logging for all users
    console.log('\n=== RANKING COMPLETO ===');
    let position = 1;
    for (const userData of sortedUsers) {
      const user = await message.client.users.fetch(userData.user_id).catch(() => null);
      if (user) {
        console.log(`#${position} ${user.username} - Level: ${userData.level}, XP: ${userData.xp}`);
        position++;
      }
    }
    console.log('=====================\n');

    // Get first 8 users for display
    const displayUsers = sortedUsers.slice(0, 8);
    
    const canvas = createCanvas(800, 750);
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('— Scripture', canvas.width / 2, 50);

    let yPosition = 100;
    const rowHeight = 75;
    
    for (let i = 0; i < 8; i++) {
      const userData = displayUsers[i];
      if (!userData) {
        // Create empty slot for missing position
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(20, yPosition, canvas.width - 40, rowHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`#${i + 1} Empty Position`, 100, yPosition + rowHeight/2);
        yPosition += rowHeight + 10;
        continue;
      }

      const user = await message.client.users.fetch(userData.user_id).catch(() => null);
      if (!user) continue;

      // Get user's background
      const profile = await getUserProfile(userData.user_id);
      const bgPath = profile.background 
        ? path.join(__dirname, '..', 'assets', 'background', profile.background)
        : path.join(__dirname, '..', 'assets', 'background', 'background.png');

      try {
        const bgImage = await loadImage(bgPath);
        ctx.globalAlpha = 0.3;
        ctx.drawImage(bgImage, 20, yPosition, canvas.width - 40, rowHeight);
        ctx.globalAlpha = 1.0;
      } catch (err) {
        ctx.fillStyle = '#1e90ff';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(20, yPosition, canvas.width - 40, rowHeight);
        ctx.globalAlpha = 1.0;
      }

      // User avatar
      try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(55, yPosition + rowHeight/2, 25, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 30, yPosition + rowHeight/2 - 25, 50, 50);
        ctx.restore();
      } catch (err) {
        console.error('Error loading avatar:', err);
      }

      // Text overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, yPosition, canvas.width - 40, rowHeight);

      // Rank number and username
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`#${i + 1} ${user.username}`, 100, yPosition + rowHeight/2);

      // XP and Level info
      ctx.font = '18px Arial';
      ctx.fillText(`XP: ${userData.xp}`, 400, yPosition + rowHeight/2);
      
      ctx.fillText('LEVEL', 600, yPosition + rowHeight/2 - 10);
      const levelBadge = await createLevelBadge(userData.level || 0, 35);
      const levelImg = await loadImage(levelBadge);
      ctx.drawImage(levelImg, 670, yPosition + rowHeight/2 - 25, 35, 35);

      yPosition += rowHeight + 10;
    }

    return message.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'ranking.png' }] });
  }
};
