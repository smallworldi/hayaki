
const { createCanvas, loadImage } = require('canvas');
const { getXPLeaderboard, getUserProfile } = require('../database');
const { createLevelBadge } = require('../utils/badges');
const path = require('path');

module.exports = {
  name: 'ranking',
  async execute(message, args) {
    const leaderboard = await getXPLeaderboard();
    const sortedUsers = leaderboard
      .filter(user => user.level > 0)  // Only show users with levels
      .sort((a, b) => {
        if (b.level !== a.level) {
          return b.level - a.level; // First sort by level
        }
        return b.xp - a.xp; // If levels are equal, sort by XP
      })
      .slice(0, 10); // Show top 10 instead of 5
    
    const canvas = createCanvas(800, 800); // Increased height for more entries
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('— Scripture', canvas.width / 2, 50);

    let yPosition = 80;
    const rowHeight = 85;
    
    for (let i = 0; i < sortedUsers.length; i++) {
      const userData = sortedUsers[i];
      const user = await message.client.users.fetch(userData.user_id).catch(() => null);
      if (!user) continue;

      // Get user's background
      const profile = await getUserProfile(userData.user_id);
      const bgPath = profile.background 
        ? path.join(__dirname, '..', 'assets', 'background', profile.background)
        : path.join(__dirname, '..', 'assets', 'background', 'background.png');

      try {
        const bgImage = await loadImage(bgPath);
        ctx.globalAlpha = 0.5; // Set opacity to 50%
        ctx.drawImage(bgImage, 50, yPosition, canvas.width - 50, rowHeight);
        ctx.globalAlpha = 1.0; // Reset opacity for other elements
      } catch (err) {
        console.error('Error loading background:', err);
        ctx.fillStyle = '#1e90ff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(50, yPosition, canvas.width - 50, rowHeight);
        ctx.globalAlpha = 1.0;
      }

      // User avatar
      try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(55, yPosition + 40, 30, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, yPosition + 10, 60, 60);
        ctx.restore();
      } catch (err) {
        console.error('Error loading avatar:', err);
      }

      // Semi-transparent overlay for better text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, yPosition, canvas.width, rowHeight);

      // Rank number and username
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`#${i + 1} ${user.username}`, 100, yPosition + 35);

      // User ID
      ctx.font = '18px Arial';
      ctx.fillText(`ID: ${userData.user_id}`, 100, yPosition + 60);

      // XP info and level badge
      ctx.fillText(`XP Total: ${userData.xp} // `, 400, yPosition + 60);
      
      // Add "LEVEL" text and badge
      ctx.fillText('LEVEL', 585, yPosition + 53);
      const levelBadge = await createLevelBadge(userData.level || 0, 40);
      const levelImg = await loadImage(levelBadge);
      ctx.drawImage(levelImg, 650, yPosition + 25, 40, 40);

      yPosition += rowHeight;
    }

    return message.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'ranking.png' }] });
  }
};
