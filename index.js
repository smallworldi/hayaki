const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user)) {

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

    const sentMessage = await message.channel.send({
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