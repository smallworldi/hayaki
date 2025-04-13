const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  presence: {
    status: 'dnd'
  }
});

client.commands = new Collection();
const prefix = '!';

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) client.commands.set(command.data.name, command);
  if (command.name) client.commands.set(command.name, command);
}

const recentMessages = new Map();

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'lang_russian') {
    const russianEmbed = {
      title: '🤖 Информация о боте',
      description: 'Этот бот является **приватным административным ботом** сервера.\nОн поддерживает только команды для модерации (бан, мут, таймаут и т.п.).',
      color: 0x000000,
      footer: { text: 'Нажми 🇬🇧 для перевода на английский' }
    };
    await interaction.update({ embeds: [russianEmbed], components: [getLanguageButtons()] });
  } else if (interaction.customId === 'lang_english') {
    const englishEmbed = {
      title: '🤖 Bot Information',
      description: 'This is a **private administration bot** for this server.\nIt only supports moderation commands (ban, mute, timeout, etc).',
      color: 0x000000,
      footer: { text: 'Click 🇷🇺 to view the Russian version' }
    };
    await interaction.update({ embeds: [englishEmbed], components: [getLanguageButtons()] });
  } else if (interaction.customId === 'create_voice') {
    await interaction.reply('Please enter a name for your voice channel:');
    
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });
    
    collector.on('collect', async nameMsg => {
      const channelName = nameMsg.content;
      await interaction.followUp('Please specify the user limit (number):');
      
      const limitCollector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });
      
      limitCollector.on('collect', async limitMsg => {
        const userLimit = parseInt(limitMsg.content);
        
        if (isNaN(userLimit) || userLimit < 1 || userLimit > 99) {
          return interaction.followUp('Invalid user limit. Please try again.');
        }

        try {
          // Watch for the user joining the setup channel
          const setupHandler = async (oldState, newState) => {
            if (newState.member.id === interaction.user.id && newState.channelId === '1359954764598612089') {
              const voiceChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 2,
                userLimit: userLimit,
                parent: '1359954462680027276',
                permissionOverwrites: [
                  {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.Connect]
                  },
                  {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.Connect]
                  }
                ]
              });

              // Move user to their new channel
              await newState.setChannel(voiceChannel);
              client.off('voiceStateUpdate', setupHandler);

              // Watch for user leaving their channel
              const leaveHandler = async (oldState, newState) => {
                if (oldState.member.id === interaction.user.id && oldState.channelId === voiceChannel.id) {
                  await voiceChannel.delete().catch(() => {});
                  client.off('voiceStateUpdate', leaveHandler);
                }
              };
              
              client.on('voiceStateUpdate', leaveHandler);
            }
          };

          client.on('voiceStateUpdate', setupHandler);

          const successEmbed = new EmbedBuilder()
            .setTitle('✅ Channel Created')
            .setDescription(`Your private channel "${channelName}" has been created!\nUser limit: ${userLimit}\nPlease join the temporary "create call" channel to complete setup.`)
            .setColor('#000000');

          await interaction.followUp({ embeds: [successEmbed] });

          
        } catch (error) {
          console.error(error);
          await interaction.followUp('An error occurred while creating the channel.');
        }
      });
    });
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  const content = message.content.toLowerCase();

  const invitesRegex = /(discord\.gg\/|discord\.com\/invite\/)/;
  const linksRegex = /https?:\/\/|www\./;

  if (invitesRegex.test(content) || linksRegex.test(content)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await message.delete().catch(() => {});
      const warn = await message.channel.send(`${message.author}, ссылки запрещены!`);
      setTimeout(() => warn.delete().catch(() => {}), 3000);
      return;
    }
  }

  if (!recentMessages.has(userId)) {
    recentMessages.set(userId, []);
  }

  const userMessages = recentMessages.get(userId);
  userMessages.push({ content: message.content, timestamp: now });

  const filtered = userMessages.filter(msg => now - msg.timestamp < 5000);
  recentMessages.set(userId, filtered);

  const repeatedMessages = filtered.filter(m => m.content === message.content);

  if (repeatedMessages.length >= 3 || filtered.length >= 6) {
    await message.delete().catch(() => {});

    const member = message.member;

    if (member.moderatable) {
      try {
        await member.timeout(5 * 60 * 1000, 'Автоматическое мутирование за спам/флуд');
        const warn = await message.channel.send(`${member} был автоматически замучен на 5 минут за спам/флуд.`);
        setTimeout(() => warn.delete().catch(() => {}), 3000);
      } catch (err) {
        console.error('Ошибка при попытке замутить:', err);
      }
    } else {
      const warn = await message.channel.send(`Не удалось замутить ${member}. У бота нет прав.`);
      setTimeout(() => warn.delete().catch(() => {}), 3000);
    }
    return;
  }

  if (message.mentions.has(client.user) && message.content.trim() === `<@${client.user.id}>`) {
    const russianEmbed = {
      title: '🤖 Информация о боте',
      description: 'Этот бот является **приватным административным ботом** сервера.\nОн поддерживает только команды для модерации (бан, мут, таймаут и т.п.).',
      color: 0x000000,
      footer: { text: 'Нажми 🇬🇧 для перевода на английский' }
    };

    const englishEmbed = {
      title: '🤖 Bot Information',
      description: 'This is a **private administration bot** for this server.\nIt only supports moderation commands (ban, mute, timeout, etc).',
      color: 0x000000,
      footer: { text: 'Click 🇷🇺 to view the Russian version' }
    };

    await message.channel.send({
      embeds: [russianEmbed],
      components: [getLanguageButtons()]
    });
  }

  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command || !command.prefixExecute) return;

  try {
    await command.prefixExecute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('Произошла ошибка при выполнении команды.');
  }
});

client.once(Events.ClientReady, () => {
  console.log(`Бот ${client.user.tag} запущен!`);
});

client.login(process.env.TOKEN);

function getLanguageButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lang_russian')
      .setLabel('🇷🇺 Русский')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('lang_english')
      .setLabel('🇬🇧 English')
      .setStyle(ButtonStyle.Secondary)
  );
}

require('./server');