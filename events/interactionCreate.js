const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserProfile, updateUserProfile } = require('../database');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'change_bio') {
      const modal = new ModalBuilder()
        .setCustomId('bio_modal')
        .setTitle('Alterar sua Biografia');

      const bioInput = new TextInputBuilder()
        .setCustomId('bio_input')
        .setLabel('Nova Biografia')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setPlaceholder('Digite sua nova biografia aqui...')
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder().addComponents(bioInput);
      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);
      return;
    }

    if (interaction.customId === 'bio_modal') {
      const bio = interaction.fields.getTextInputValue('bio_input');
      const profile = await getUserProfile(interaction.user.id);

      await updateUserProfile(interaction.user.id, {
        ...profile,
        bio: bio
      });

      await interaction.reply({ content: '✅ Bio atualizada com sucesso!', ephemeral: true });
      return;
    }
    if (!interaction.isButton() && !interaction.isCommand()) return;

    if (interaction.isCommand() && interaction.commandName === 'balance') {
      const userProfile = await getUserProfile(interaction.user.id);
      if (!userProfile) return interaction.reply("Profile not found!");

      const balanceEmbed = new EmbedBuilder()
        .setTitle('Your Balance')
        .setDescription(`**Username:** ${interaction.user.username}\n**ID:** ${interaction.user.id}\n**Balance:** ${userProfile.balance}`)
        .setColor(0x0099FF);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('send')
            .setLabel('Send')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('withdraw')
            .setLabel('Withdraw')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('deposit')
            .setLabel('Deposit')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('bank')
            .setLabel('Bank')
            .setStyle(ButtonStyle.Primary)
        );


      await interaction.reply({ embeds: [balanceEmbed], components: [row] });
      return;
    }


    if (interaction.isButton()) {
      const { getUser, updateUser } = require('../database');

      switch (interaction.customId) {
        case 'withdraw':
          // Create withdraw modal
          const withdrawModal = new ModalBuilder()
            .setCustomId('withdraw_modal')
            .setTitle('Withdraw Money');

          const withdrawAmount = new TextInputBuilder()
            .setCustomId('withdraw_amount')
            .setLabel('Amount to withdraw')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          withdrawModal.addComponents(new ActionRowBuilder().addComponents(withdrawAmount));
          await interaction.showModal(withdrawModal);
          break;

        case 'deposit':
          try {
            const depositModal = new ModalBuilder()
              .setCustomId('deposit_modal')
              .setTitle('Deposit Money');

            const depositAmount = new TextInputBuilder()
              .setCustomId('deposit_amount')
              .setLabel('Amount to deposit')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder('Enter amount to deposit');

            const actionRow = new ActionRowBuilder().addComponents(depositAmount);
            depositModal.addComponents(actionRow);
            await interaction.showModal(depositModal);
          } catch (error) {
            console.error('Error showing deposit modal:', error);
            await interaction.reply({ 
              content: 'There was an error processing your deposit request. Please try again.',
              ephemeral: true 
            });
          }
          break;

        case 'send':
          // Create send money modal
          const sendModal = new ModalBuilder()
            .setCustomId('send_modal')
            .setTitle('Send Money');

          const recipient = new TextInputBuilder()
            .setCustomId('recipient')
            .setLabel('Recipient ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const amount = new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('Amount')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          sendModal.addComponents(
            new ActionRowBuilder().addComponents(recipient),
            new ActionRowBuilder().addComponents(amount)
          );
          await interaction.showModal(sendModal);
          break;
          case 'back':
            //Handle back button -  replace with actual navigation logic.
            await interaction.reply({content: 'Returning to main menu...', ephemeral: true});
            break;
        case 'bank':
          //Handle bank button -  This needs database interaction.
          await interaction.reply({content: 'Updating balance from bank...', ephemeral:true});
          break;
      }
    }


        if (!interaction.isButton()) return;

        const [action, userId] = interaction.customId.split('_');
        if (!['approve', 'kick'].includes(action)) return;

        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) return interaction.reply({ content: 'Пользователь не найден.', ephemeral: true });

        const tempRoleId = '1361193838151991407';
        const memberRoleId = '1343021729533919434';

        const updatedEmbed = interaction.message.embeds[0].toJSON();

        if (action === 'approve') {
          try {
            await member.roles.remove(tempRoleId);
            await member.roles.add(memberRoleId);
            await member.timeout(null); // remove timeout

            updatedEmbed.color = 0x000000;
            updatedEmbed.title = '✅ Пользователь утверждён';

            await interaction.update({
              embeds: [updatedEmbed],
              components: []
            });

            await interaction.followUp({
              content: `✅ ${member.user.tag} получил роль участника.`,
              ephemeral: false
            });
          } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Ошибка при утверждении пользователя.', ephemeral: true });
          }
        }

        if (action === 'kick') {
          try {
            await member.kick('Отказ в доступе: подозрительный аккаунт');

            updatedEmbed.color = 0x000000;
            updatedEmbed.title = '❌ Пользователь изгнан';

            await interaction.update({
              embeds: [updatedEmbed],
              components: []
            });

            await interaction.followUp({
              content: `❌ ${member.user.tag} был изгнан с сервера.`,
              ephemeral: false
            });
          } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Ошибка при попытке изгнания.', ephemeral: true });
          }
        }
      }
    };