const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  name: 'ticket',
  description: 'Configure the ticket system',

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply('You don\'t have permission to use this command!');
    }

    const previewEmbed = new EmbedBuilder()
      .setTitle('Ticket System Configuration')
      .setDescription(`
        <:gear:1361815450257854707> **Ticket System Configuration**

        You are now in the process of configuring the ticket system. Please follow the steps below:

        1. **Set the Channel ID**: Enter the channel where tickets will be handled. This is where users will open their tickets.
        2. **Set the Title**: Choose a title for the embed that will be sent when a ticket is opened. This is the header that will appear to users.
        3. **Set the Description**: Write a description for the embed that will explain how the ticket system works and what users should do.
        4. **Choose Embed Color**: Pick a color for the embed that suits your server's theme.

        Once you have configured everything, click **"Send Ticket"** to make the system live! <:ticket:1361814668435521608>

        Don't forget: **You can update the settings anytime!**
      `)
      .setColor('#454545'); // Neutral color for configuration message

    const configButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('configure_ticket')
          .setLabel('Configure')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('<:configure:1361814077910945973>'),
        new ButtonBuilder()
          .setCustomId('send_ticket')
          .setLabel('Send')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('<:send:1361814257154523227>')
      );

    const configMessage = await message.channel.send({
      embeds: [previewEmbed],
      components: [configButtons]
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 300000
    });

    let channelId = null;

    collector.on('collect', async interaction => {
      if (interaction.customId === 'configure_ticket') {
        const modal = new ModalBuilder()
          .setCustomId('ticket_config_modal')
          .setTitle('Configure Ticket System');

        const channelInput = new TextInputBuilder()
          .setCustomId('channel')
          .setLabel('Channel ID')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: 123456789')
          .setRequired(true);

        const titleInput = new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Embed Title')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: Support System')
          .setRequired(true)
          .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Embed Description')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Ex: Click the button below to open a ticket')
          .setRequired(true)
          .setMaxLength(4000);

        const colorInput = new TextInputBuilder()
          .setCustomId('color')
          .setLabel('Embed Color (Hex)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Ex: #000000')
          .setRequired(true)
          .setMaxLength(7);

        modal.addComponents(
          new ActionRowBuilder().addComponents(channelInput),
          new ActionRowBuilder().addComponents(titleInput),
          new ActionRowBuilder().addComponents(descriptionInput),
          new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);

        try {
          const modalSubmit = await interaction.awaitModalSubmit({
            filter: i => i.customId === 'ticket_config_modal',
            time: 60000
          });

          channelId = modalSubmit.fields.getTextInputValue('channel');
          const title = modalSubmit.fields.getTextInputValue('title');
          const description = modalSubmit.fields.getTextInputValue('description');
          const color = modalSubmit.fields.getTextInputValue('color');

          const channel = message.guild.channels.cache.get(channelId);
          if (!channel) {
            return modalSubmit.reply({ content: 'Channel not found!', ephemeral: true });
          }

          const updatedEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

          await configMessage.edit({
            content: `📝 The embed will be sent in: ${channel}`,
            embeds: [updatedEmbed],
            components: [configButtons]
          });

          await modalSubmit.reply({ content: 'Preview updated!', ephemeral: true });
        } catch (error) {
          console.error(error);
          await interaction.followUp({ content: 'Time expired or an error occurred.', ephemeral: true });
        }
      }

      if (interaction.customId === 'send_ticket') {
        if (!channelId) {
          return interaction.reply({ content: 'Please configure the embed first!', ephemeral: true });
        }

        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
          return interaction.reply({ content: 'Channel not found!', ephemeral: true });
        }

        const ticketEmbed = configMessage.embeds[0];
        const button = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('open_ticket')
              .setLabel('Open Ticket')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('<:ticket:1361814668435521608>')
          );

        await channel.send({
          embeds: [ticketEmbed],
          components: [button]
        });

        await interaction.reply({ content: 'Ticket system sent successfully!', ephemeral: true });
        collector.stop();
      }
    });
  }
};
