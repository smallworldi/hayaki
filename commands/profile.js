
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./assets/fonts/NotoSans-Bold.ttf', { family: 'NotoSans' });
const { UserFlags, UserPremiumType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserFullProfile, getXPLeaderboard } = require('../database');
const { createLevelBadge } = require('../utils/badges');
const path = require('path');
const fs = require('fs');

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
  name: 'profile',
  aliases: ['profile'],
  async execute(message, args) {
    let userMention = args[0] ? message.mentions.users.first() : message.author;
    if (args[0] && !userMention) return message.reply('Пожалуйста, укажите правильного пользователя!');
    const user = await message.client.users.fetch(userMention.id, { force: true });

    const profile = await getUserFullProfile(user.id);
    let member = null;
    try { member = await message.guild.members.fetch(user.id); } catch {}

    const canvas = createCanvas(1024, 576);
    const ctx = canvas.getContext('2d');

    const defaultBg = path.join(__dirname, '..', 'assets', 'background', 'background.png');
    try {
      let bgPath = profile.background?.startsWith('http') ? profile.background : path.join(__dirname, '..', 'assets', 'background', profile.background || '');
      const bgImg = await loadImage(bgPath || defaultBg);
      ctx.drawImage(bgImg, 0, 0, 1024, 300);
    } catch {
      ctx.fillStyle = '#8ad2c5';
      ctx.fillRect(0, 0, 1024, 300);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 300, 1024, 276);

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
      ctx.font = '20px "NotoSans"';
      ctx.fillText(`В браке с: ${partner.username}`, 10, 322);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '22px "NotoSans"';
    ctx.fillText('ИМЯ', 20, 380);
    ctx.fillText(user.username, 20, 405);
    ctx.fillText('ID', 20, 435);
    ctx.fillText(user.id, 20, 460);
    ctx.fillText('БАЛАНС', 20, 490);
    ctx.fillText(`${(profile.wallet || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`, 20, 515);
    ctx.fillText('ОПЫТ/ЦЕЛЬ', 20, 545);
    ctx.fillText(`${profile.xp || 0}/${profile.xp_goal || '???'}`, 20, 570);

    ctx.fillText('УРОВЕНЬ', 820, 390);
    const lvlBuf = createLevelBadge(profile.level || 0, 40);
    const lvlImg = await loadImage(lvlBuf);
    ctx.drawImage(lvlImg, 930, 360, 40, 40);

    const xpLeaderboard = await getXPLeaderboard(message.guild.id);
    ctx.fillText('РАНГ', 820, 440);
    const rank = xpLeaderboard.findIndex(e => e.user_id === user.id) + 1;
    ctx.fillText(`#${rank > 0 ? rank : 'Неизвестно'}`, 820, 465);

    ctx.fillText('РЕПУТАЦИЯ', 820, 490);
    ctx.fillText(`${profile.reps || 0}`, 820, 515);

    const flags = (await user.fetch(true)).flags;
    const badges = [];
    if (user.bot) badges.push('verified_bot');
    if (flags?.has(UserFlags.VerifiedDeveloper)) badges.push('developer');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse1)) badges.push('hypesquad_bravery');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse2)) badges.push('hypesquad_brilliance');
    if (flags?.has(UserFlags.HypeSquadOnlineHouse3)) badges.push('hypesquad_balance');
    if (flags?.has(UserFlags.PremiumEarlySupporter)) badges.push('early_supporter');
    if (flags?.has(UserFlags.CertifiedModerator)) badges.push('certified_mod');

    if (member) {
      if (member.premiumType === 2) badges.push('nitro');
      else if (member.premiumType === 1) badges.push('nitro_classic');
      else if (member.premiumType === 3) badges.push('nitro_basic');

      if (member.premiumSince) {
        const months = Math.floor((Date.now() - member.premiumSince) / (30 * 24 * 60 * 60 * 1000));
        if (months >= 15) badges.push('boost3');
        else if (months >= 6) badges.push('boost2');
        else badges.push('boost1');
      }
    }

    ctx.fillText(user.username, 20, 405);
    for (let i = 0; i < badges.length; i++) {
      const key = badges[i];
      const file = Emojis[key];
      if (!file) continue;
      try {
        const imgPath = path.join(__dirname, '..', 'assets', 'emojis', file);
        const badgeImg = await loadImage(imgPath);
        ctx.drawImage(badgeImg, 20 + ctx.measureText(user.username).width + 10 + (i * 35), 380, 25, 25);
      } catch (err) {
        console.error(`Ошибка загрузки значка ${key}:`, err.message);
      }
    }

    const customBadges = profile.badges ? JSON.parse(profile.badges) : [];
    for (let i = 0; i < customBadges.length; i++) {
      const emojiId = customBadges[i];
      try {
        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
        const badgeImg = await loadImage(emojiUrl);
        ctx.drawImage(badgeImg, 20 + ctx.measureText(user.username).width + 10 + ((badges.length + i) * 35), 380, 25, 25);
      } catch (err) {
        console.error(`Ошибка загрузки эмодзи ${emojiId}:`, err.message);
      }
    }

    ctx.textAlign = 'center';
    ctx.font = 'italic 20px "NotoSans"';
    const bio = profile.bio || 'У этого пользователя нет биографии.';
    const emojiRegex = /<a?:\w+:\d+>/g;
    const cleanBio = bio.replace(emojiRegex, '🔸');
    ctx.fillText(cleanBio, 512, 565);

    const emojis = bio.match(emojiRegex) || [];
    let emojiX = 512 - (ctx.measureText(cleanBio).width / 2);
    for (const emojiMatch of emojis) {
      const emojiId = emojiMatch.match(/\d+/)[0];
      try {
        const emojiImg = await loadImage(`https://cdn.discordapp.com/emojis/${emojiId}.png`);
        ctx.drawImage(emojiImg, emojiX, 545, 20, 20);
        emojiX += 20;
      } catch (err) {
        console.error('Ошибка загрузки эмодзи:', err);
      }
    }

    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 300, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 412, 200, 200, 200);
    ctx.restore();

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
      ctx.font = '20px "NotoSans"';
      ctx.fillText('Разработчик Hayaki', 910, 282);
    } else if (profile.title && profile.titleGradient) {
      const gradient = ctx.createLinearGradient(1024, 0, 724, 0);
      gradient.addColorStop(0, profile.titleGradient.start);
      gradient.addColorStop(1, profile.titleGradient.end);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(1024, 260);
      ctx.lineTo(724, 260);
      ctx.lineTo(754, 290);
      ctx.lineTo(1024, 290);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '20px "NotoSans"';
      ctx.fillText(profile.title, 910, 282);
    }

    const bioButton = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setCustomId('change_bio').setLabel('Изменить биографию').setStyle(ButtonStyle.Secondary));

    const buffer = canvas.toBuffer();
    return message.channel.send({
      files: [{ attachment: buffer, name: 'profile.png' }],
      components: userMention.id === message.author.id ? [bioButton] : []
    });
  }
};
