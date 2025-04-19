const { EmbedBuilder } = require('discord.js');
const { getCooldown, setCooldown } = require('../database');

const COOLDOWN_TIME = 5000; // 5 segundos
const MIN_BET = 50;
const MAX_BET = 25000;

module.exports = {
  name: 'baccarat',
  description: 'Play a game of Baccarat with bets',
  async execute(message, args = []) {
    const userId = message.author.id;
    const now = Date.now();

    // Verificar cooldown
    const lastUsed = await getCooldown(userId, 'baccarat');
    if (now - lastUsed < COOLDOWN_TIME) {
      const timeLeft = Math.ceil((COOLDOWN_TIME - (now - lastUsed)) / 1000);
      return message.reply(`❌ Aguarde ${timeLeft} segundo(s) para jogar novamente.`);
    }

    if (!Array.isArray(args) || args.length < 2) {
      return message.reply('❌ Correct usage: !baccarat [player/banker/tie] [amount]');
    }

    const bet = args[0]?.toLowerCase();
    if (!['player', 'banker', 'tie'].includes(bet)) {
      return message.reply('❌ Choose player, banker or tie to bet!');
    }

    const amount = parseInt(args[1], 10);
    if (isNaN(amount) || amount < MIN_BET || amount > MAX_BET) {
      return message.reply(`❌ A aposta deve ser entre ${MIN_BET} e ${MAX_BET} Synths!`);
    }

const { getUser, updateUser, getUserProfile, updateUserProfile } = require('../database');
let { wallet: userBalance } = await getUser(message.author.id);
if (userBalance < amount) {
  return message.reply('❌ Insufficient balance!');
}

    function drawCard() {
      const value = Math.floor(Math.random() * 13) + 1;
      return value > 10 ? 0 : value; // 10, J, Q, K = 0
    }

    function calculateHand(cards) {
      return cards.reduce((sum, card) => (sum + card) % 10, 0);
    }

    function getCardEmoji(value) {
      const emojiVariants = {
        0: [
          '<:tenofdiamonds:1361925788559212645>',
          '<:tenofhearts:1361925775040839740>',
          '<:tenofspades:1361926028385190060>',
          '<:tenofclubs:1361925957325160510>',
          '<:jackofspades:1361931933994455042>',
          '<:jackofdiamonds:1361931989120188466>',
          '<:jackofclubs:1361932027162791956>',
          '<:jackofhearts:1361932045424791632>',
          '<:queenofspades:1361932060675145850>',
          '<:queenofclubs:1361932075376185415>',
          '<:queenofdiamonds:1361932091016876052>',
          '<:queenofhearts:1361932106032353290>',
          '<:kingofspades:1361932224806781008>',
          '<:kingofclubs:1361932243731353682>',
          '<:kingofdiamonds:1361932260407902308>',
          '<:kingofhearts:1361932321330040944>'
        ],
1: [
  '<:aceofhearts:1361939314866389093>',
  '<:aceofdiamonds:1361939333438767104>',
  '<:aceofclubs:1361939356872474746>',
  '<:aceofspades:1361939376363409478>'
],
        2: ['<:twoofclubs:1361916657366335619>', '<:twoofspades:1361916831732076735>', '<:twoofdiamonds:1361916981753938071>', '<:twoofhearts:1361917301867282643>'],
        3: ['<:threeofhearts:1361919399300300851>', '<:threeofdiamonds:1361919297861193779>', '<:threeofclubs:1361919205028663336>', '<:threeofspades:1361918953022296174>'],
        4: ['<:fourofhearts:1361920506541903992>', '<:fourofdiamonds:1361920386006126694>', '<:fourofspades:1361920274542366832>', '<:fourofclubs:1361920258235170816>'],
        5: ['<:fiveofspades:1361921162455552131>', '<:fiveofclubs:1361921340927643728>', '<:fiveofdiamonds:1361921474067431608>', '<:fiveofhearts:1361921615994159238>'],
        6: ['<:sixofspades:1361922378753380362>', '<:sixofclubs:1361922363373125683>', '<:sixofdiamonds:1361922347837161473>', '<:sixofhearts:1361922335656906954>'],
        7: ['<:sevenofspades:1361923478223327343>', '<:sevenofclubs:1361923461546774642>', '<:sevenofdiamonds:1361923446749138994>', '<:sevenofhearts:1361923432824176770>'],
        8: ['<:eightofhearts:1361924255872319688>', '<:eightofdiamonds:1361924241590718644>', '<:eightofclubs:1361924228210757803>', '<:eightofspades:1361924214046855268>'],
        9: ['<:nineofspades:1361925011580911797>', '<:nineofclubs:1361924995286040606>', '<:nineofdiamonds:1361924979779960974>', '<:nineofhearts:1361924965317738576>'],
        10: ['<:tenofdiamonds:1361925788559212645>', '<:tenofhearts:1361925775040839740>', '<:tenofspades:1361926028385190060>', '<:tenofclubs:1361925957325160510>']
      };
      const options = emojiVariants[value];
      return options ? options[Math.floor(Math.random() * options.length)] : `(${value})`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Baccarat - Betting in progress...')
      .setColor('#FFFFFF')
      .addFields(
        { name: 'Your Bet', value: `${bet} - ${amount} Synths`, inline: false },
        { name: 'Player Cards', value: 'Waiting...', inline: true },
        { name: 'Player Score', value: 'Waiting...', inline: true },
        { name: 'Banker Cards', value: 'Waiting...', inline: true },
        { name: 'Banker Score', value: 'Waiting...', inline: true },
        { name: 'Result', value: 'Waiting...', inline: false },
        { name: 'New Balance', value: `${userBalance} Synths`, inline: false }
      );

    const msg = await message.reply({ embeds: [embed] });

    const playerCards = [drawCard(), drawCard()];
    const bankerCards = [drawCard(), drawCard()];
    const delay = ms => new Promise(res => setTimeout(res, ms));

    await delay(3000);
    embed.spliceFields(1, 1, {
      name: 'Player Cards',
      value: playerCards.map(getCardEmoji).join(' '),
      inline: true
    });
    embed.spliceFields(2, 1, {
      name: 'Player Score',
      value: calculateHand(playerCards).toString(),
      inline: true
    });
    await msg.edit({ embeds: [embed] });

    await delay(3000);
    embed.spliceFields(3, 1, {
      name: 'Banker Cards',
      value: bankerCards.map(getCardEmoji).join(' '),
      inline: true
    });
    embed.spliceFields(4, 1, {
      name: 'Banker Score',
      value: calculateHand(bankerCards).toString(),
      inline: true
    });
    await msg.edit({ embeds: [embed] });

    let playerScore = calculateHand(playerCards);
    let bankerScore = calculateHand(bankerCards);

    // Player draws third card
    if (playerScore <= 5) {
      await delay(3000);
      embed.setColor('#FFA500').setTitle('Drawing third card for Player...');
      await msg.edit({ embeds: [embed] });

      await delay(3000);
      const newCard = drawCard();
      playerCards.push(newCard);
      playerScore = calculateHand(playerCards);
      embed.setTitle('Baccarat - Betting in progress...').setColor('#FFFFFF');
      embed.spliceFields(1, 1, {
        name: 'Player Cards',
        value: playerCards.map(getCardEmoji).join(' '),
        inline: true
      });
      embed.spliceFields(2, 1, {
        name: 'Player Score',
        value: playerScore.toString(),
        inline: true
      });
      await msg.edit({ embeds: [embed] });
    }

    // Banker draws third card
    if (bankerScore <= 5 || (bankerScore === 6 && playerScore >= 6)) {
      await delay(3000);
      embed.setColor('#FFA500').setTitle('Drawing third card for Banker...');
      await msg.edit({ embeds: [embed] });

      await delay(3000);
      const newCard = drawCard();
      bankerCards.push(newCard);
      bankerScore = calculateHand(bankerCards);
      embed.setTitle('Baccarat - Betting in progress...').setColor('#FFFFFF');
      embed.spliceFields(3, 1, {
        name: 'Banker Cards',
        value: bankerCards.map(getCardEmoji).join(' '),
        inline: true
      });
      embed.spliceFields(4, 1, {
        name: 'Banker Score',
        value: bankerScore.toString(),
        inline: true
      });
      await msg.edit({ embeds: [embed] });
    }

    let result;
    let winnings = 0;

    if (playerScore > bankerScore) {
      result = 'Player wins!';
      if (bet === 'player') winnings = amount * 2;
    } else if (bankerScore > playerScore) {
      result = 'Banker wins!';
      if (bet === 'banker') winnings = Math.floor(amount * 1.95);
    } else {
      result = 'It\'s a Tie!';
      winnings = (bet === 'tie') ? amount * 8 : amount; // Tie bet wins 8x, otherwise return the original bet
    }

    userBalance -= amount;
    userBalance += winnings;
    await updateUser(message.author.id, {
      wallet: userBalance
    });

    // Add small XP reward
    const xpGain = Math.floor(Math.random() * 30) + 15;
    const userProfile = await getUserProfile(message.author.id);
    await updateUserProfile(message.author.id, {
      ...userProfile,
      xp: userProfile.xp + xpGain
    });


    embed.setTitle('Baccarat - Game Over!')
      .setColor(winnings > amount ? '#454545' : (winnings === amount ? '#FFFFFF' : '#9a46ca'))
      .spliceFields(5, 1, { name: 'Result', value: result, inline: false })
      .spliceFields(6, 1, { name: 'New Balance', value: `${userBalance} Synths`, inline: false });

    await msg.edit({ embeds: [embed] });
    
    // Atualizar cooldown após o jogo
    await setCooldown(userId, 'baccarat', now);
  }
};