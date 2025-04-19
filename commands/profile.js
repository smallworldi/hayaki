const { createCanvas, loadImage } = require('canvas');
const { UserFlags, UserPremiumType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserFullProfile, getXPLeaderboard } = require('../database');
const { createLevelBadge } = require('../utils/badges');
const path = require('path');
const fs = require('fs');

// Map badge keys to local PNG files
const Emojis = {
  nitro_classic: 'nitro.png',
  nitro: 'nitro.png',
  nitro_basic: 'nitro.png',
  boost1: 'boost1.png',
  boost2: 'boost2.png',
  boost3: 'boost3.png',
  verified_bot: 'verified_bot.png',
  developer: 'developer.png',
  hypesquad_bravery: 'hypesquadbravery.png',
  hypesquad_brilliance: 'hypesquadbrilliance.png',
  hypesquad_balance: 'hypesquadbalance.png',
  early_supporter: 'early_supporter.png',
  certified_mod: 'certified_mod.png'
};

module.exports = {
  name: 'perfil',
  aliases: ['profile'],
  async execute(message, args) {
    let userMention;
    if (args[0]) {
      userMention = message.mentions.users.first();
      if (!userMention) {
        return message.reply('Por favor, mencione um usuário válido!');
      }
    } else {
      userMention = message.author;
    }
    const user = await message.client.users.fetch(userMention.id, { force: true });

    const profile = await getUserFullProfile(user.id);
    let member = null;
    try {
      member = await message.guild.members.fetch(user.id);
    } catch {
      // Usuário não está no servidor
    }


    // Canvas setup
    const canvas = createCanvas(1024, 576);
    const ctx = canvas.getContext('2d');

    // Background
    const defaultBg = path.join(__dirname, '..', 'assets', 'background', 'background.png');
    try {
      let bgPath;
      if (profile.background) {
        bgPath = profile.background.startsWith('http') 
          ? profile.background 
          : path.join(__dirname, '..', 'assets', 'background', profile.background);
      } else {
        bgPath = defaultBg;
      }
      const bgImg = await loadImage(bgPath);
      ctx.drawImage(bgImg, 0, 0, 1024, 300);
    } catch (err) {
      console.error('Erro ao carregar background:', err);
      ctx.fillStyle = '#8ad2c5';
      ctx.fillRect(0, 0, 1024, 300);
    }

    // Bottom panel
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, 1024, 276);

    // Married badge
    if (profile.married_with) {
      const partner = await message.client.users.fetch(profile.married_with);
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
      ctx.fillText(`Casado(a): ${partner.username}`, 10, 322);
    }

    // User info
    ctx.fillStyle = '#fff';
    ctx.font = '22px Arial';
    ctx.fillText('NOME', 20, 380);
    ctx.fillText(user.username, 20, 405);
    ctx.fillText('ID', 20, 435);
    ctx.fillText(user.id, 20, 460);
    ctx.fillText('SALDO', 20, 490);
    ctx.fillText(`${(profile.wallet || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Synths`, 20, 515);
    ctx.fillText('XP/META', 20, 545);
    ctx.fillText(`${profile.xp || 0}/${profile.xp_goal || '???'}`, 20, 570);

    // Level badge
    ctx.fillText('LEVEL', 820, 390);
    const lvlBuf = createLevelBadge(profile.level || 0, 40);
    const lvlImg = await loadImage(lvlBuf);
    ctx.drawImage(lvlImg, 900, 360, 40, 40);

    // XP Ranking
    const xpLeaderboard = await getXPLeaderboard(message.guild.id);
    ctx.fillText('RANKING LEVEL', 820, 440);
    if (!Array.isArray(xpLeaderboard) || xpLeaderboard.length === 0) {
      ctx.fillText('#Desconhecido', 820, 465);
    } else {
      const rank = xpLeaderboard.findIndex(e => e.user_id === user.id) + 1;
      ctx.fillText(`#${rank > 0 ? rank : 'Desconhecido'}`, 820, 465);
    }


    const badges = [];

    // 🔹 BADGES GLOBAIS (pegas direto do User.flags)
    const flags = (await user.fetch(true)).flags;
    if (user.bot) badges.push('verified_bot');
    if (flags?.has(UserFlags.VerifiedDeveloper)) badges.push('developer');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse1)) badges.push('hypesquad_bravery');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse2)) badges.push('hypesquad_brilliance');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse3)) badges.push('hypesquad_balance');
    if (flags?.has(UserFlags.PremiumEarlySupporter)) badges.push('early_supporter');
    if (flags?.has(UserFlags.CertifiedModerator)) badges.push('certified_mod');

    // 🔹 BADGES LOCAIS (se o usuário estiver no servidor)
    if (member) {
      if (member.premiumType === 2) badges.push('nitro');
      else if (member.premiumType === 1) badges.push('nitro_classic');
      else if (member.premiumType === 3) badges.push('nitro_basic');

      if (member.premiumSince || member.premiumType) badges.push('nitro');

      if (member.premiumSince) {
        const months = Math.floor((Date.now() - member.premiumSince) / (30 * 24 * 60 * 60 * 1000));
        if (months >= 15) badges.push('boost3');
        else if (months >= 6) badges.push('boost2');
        else badges.push('boost1');
      }
    }


    // Draw username and badges
    ctx.fillText(user.username, 20, 405);

    // System badges
    if (badges.length > 0) {
      for (let i = 0; i < badges.length; i++) {
        const key = badges[i];
        const file = Emojis[key];
        if (!file) continue;
        try {
          const imgPath = path.join(__dirname, '..', 'assets', 'emojis', file);
          const badgeImg = await loadImage(imgPath);
          ctx.drawImage(badgeImg, 20 + ctx.measureText(user.username).width + 10 + (i * 35), 380, 25, 25);
        } catch (err) {
          console.error(`Erro ao carregar badge ${key}:`, err.message);
        }
      }
    }

    // Custom badges
    const customBadges = profile.badges ? JSON.parse(profile.badges) : [];
    if (customBadges.length > 0) {
      for (let i = 0; i < customBadges.length; i++) {
        const emojiId = customBadges[i];
        try {
          const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
          const badgeImg = await loadImage(emojiUrl);
          ctx.drawImage(badgeImg, 20 + ctx.measureText(user.username).width + 10 + ((badges.length + i) * 35), 380, 25, 25);
        } catch (err) {
          console.error(`Erro ao carregar emoji personalizado ${emojiId}:`, err.message);
        }
      }
    }

    // Official Discord flags
    if (user.bot) badges.push('verified_bot');
    if (user.flags?.has(UserFlags.VerifiedDeveloper)) badges.push('developer');
    if (user.flags?.has(UserFlags.HypeSquadOnlineHouse1)) badges.push('hypesquad_bravery');
    if (user.flags?.has(UserFlags.HypeSquadOnlineHouse2)) badges.push('hypesquad_brilliance');
    if (user.flags?.has(UserFlags.HypeSquadOnlineHouse3)) badges.push('hypesquad_balance');
    if (user.flags?.has(UserFlags.PremiumEarlySupporter)) badges.push('early_supporter');
    if (user.flags?.has(UserFlags.CertifiedModerator)) badges.push('certified_mod');




    // Bio
    ctx.textAlign = 'center';
    ctx.font = 'italic 20px Arial';
    ctx.fillText(profile.bio || 'Este usuário não tem uma biografia.', 512, 565);

    // Avatar
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 300, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 412, 200, 200, 200);
    ctx.restore();

    // Developer badge
    const { isDeveloper } = require('../utils/developers');
    if (isDeveloper(user.id)) {
      const gradient = ctx.createLinearGradient(1024, 0, 724, 0); 
      gradient.addColorStop(0, 'rgba(139, 0, 0, 0.5)'); 
      gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');   

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(1024, 260);
      ctx.lineTo(724, 260);
      ctx.lineTo(754, 290);
      ctx.lineTo(1024, 290);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Hayaki Developer', 910, 282);
    }


    // Send image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./profile-card.png', buffer);
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('change_bio')
          .setLabel('Change Bio')
          .setStyle(ButtonStyle.Secondary)
      );

    return message.channel.send({ 
      files: ['./profile-card.png'],
      components: userMention.id === message.author.id ? [row] : []
    });
  }
};