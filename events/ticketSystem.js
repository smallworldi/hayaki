const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const cooldowns = new Map(); // cooldowns for call_staff
const fs = require('fs');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'open_ticket') {
        const modal = new ModalBuilder()
          .setCustomId('ticket_modal')
          .setTitle('Open a Ticket');

        const motiveInput = new TextInputBuilder()
          .setCustomId('motive')
          .setLabel('What is the reason for your ticket?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(motiveInput));
        await interaction.showModal(modal);
      }

      if (interaction.customId === 'close_ticket') {
        const thread = interaction.channel;
        await thread.send('<:lock:1361816276896448552> Ticket closed');
        await thread.setLocked(true);
        await interaction.reply({ content: 'The ticket has been closed.' }); // Not ephemeral
      }

      if (interaction.customId === 'delete_ticket') {
        if (!interaction.member.roles.cache.has('1347292617070739663')) {
          return interaction.reply({
            content: '❌ Only the support team can delete tickets!',
            ephemeral: true
          });
        }

        const thread = interaction.channel;
        const messages = await thread.messages.fetch();
let transcript = '';

messages.reverse().forEach(msg => {
  transcript += `${msg.author.tag} (${msg.author.id}): ${msg.content}\n`;
});

const logChannel = interaction.guild.channels.cache.get('1361137563632533614');

const now = new Date();
const formattedDate = `(${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')})`;

const fileName = `${formattedDate} - ticket - ${interaction.user.username} - ${interaction.user.id}.txt`;

await logChannel.send({
  files: [{
    attachment: Buffer.from(transcript),
    name: fileName
  }]
});

        await thread.delete();
      }

      if (interaction.customId === 'archive_ticket') {
        if (!interaction.member.roles.cache.has('1347292617070739663')) {
          return interaction.reply({
            content: '❌ Only the support team can archive tickets!',
            ephemeral: true
          });
        }
        const thread = interaction.channel;
        await thread.setArchived(true);
        await interaction.reply({ content: 'The ticket has been archived.', ephemeral: true });
      }

      if (interaction.customId === 'claim_ticket') {
        if (!interaction.member.roles.cache.has('1347292617070739663')) {
          return interaction.reply({
            content: '❌ Only the support team can claim tickets!',
            ephemeral: true
          });
        }

        const thread = interaction.channel;
        const firstMessage = (await thread.messages.fetch()).last();

        const staffButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:lock:1361816276896448552>'),
          new ButtonBuilder()
            .setCustomId('call_staff')
            .setLabel('Call Staff')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:call:1361816425676935368>'),
          new ButtonBuilder()
            .setCustomId('delete_ticket')
            .setLabel('Delete')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:trash:1361816626705600813>'),
          new ButtonBuilder()
            .setCustomId('archive_ticket')
            .setLabel('Archive')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:archive:1361816761397285016>')
        );

        const oldEmbed = firstMessage.embeds[0];
        const newEmbed = new EmbedBuilder()
          .setTitle(oldEmbed.title)
          .addFields(
            oldEmbed.fields[0],
            { name: 'Claimed by', value: `${interaction.user.tag}` },
            oldEmbed.fields[1]
          )
          .setColor('#9a46ca');

        await firstMessage.edit({
          content: firstMessage.content,
          embeds: [newEmbed],
          components: [staffButtons]
        });

        await interaction.reply({
          content: `<:shield:1361816982407610438> Ticket claimed by ${interaction.user}`,
          ephemeral: true
        });
      }

      if (interaction.customId === 'call_staff') {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownAmount = 5 * 60 * 1000; // 5 minutes

        if (cooldowns.has(userId)) {
          const expirationTime = cooldowns.get(userId) + cooldownAmount;

          if (now < expirationTime) {
            const remaining = Math.ceil((expirationTime - now) / 1000);
            return interaction.reply({
              content: `Please wait ${Math.floor(remaining / 60)}m ${remaining % 60}s before calling staff again.`,
              ephemeral: true
            });
          }
        }

        cooldowns.set(userId, now);

        const thread = interaction.channel;
        await thread.send(`<@&1347292617070739663> was requested by ${interaction.user}.`);
        await interaction.reply({ content: `✅ Staff has been notified!`, ephemeral: true });

        setTimeout(() => cooldowns.delete(userId), cooldownAmount);
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
      const motive = interaction.fields.getTextInputValue('motive');
      const thread = await interaction.channel.threads.create({
        name: ${interaction.user.username} — ${interaction.user.id}`,
        autoArchiveDuration: 60,
        reason: 'Ticket created',
        type: 12
      });

      await thread.setAppliedTags([]);

      const embed = new EmbedBuilder()
        .setTitle('Ticket Opened')
        .addFields(
          { name: 'Author', value: `${interaction.user.tag} (${interaction.user.id})` },
          { name: 'Reason', value: motive }
        )
        .setColor('#000000');

      const initialButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('<:shield:1361816982407610438>'),
        new ButtonBuilder()
          .setCustomId('call_staff')
          .setLabel('Call Staff')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('<:call:1361816425676935368>')
      );

      await thread.send({
        content: `${interaction.user} <@&1347292617070739663>`,
        embeds: [embed],
        components: [initialButtons]
      });

      await interaction.reply({ content: `Ticket created: ${thread}`, ephemeral: true });
    }
  }
};