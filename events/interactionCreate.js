
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUserProfile, updateUserProfile } = require('../database');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.customId === 'change_bio') {
      const modal = new ModalBuilder()
        .setCustomId('bio_modal')
        .setTitle('Изменить биографию');

      const bioInput = new TextInputBuilder()
        .setCustomId('bio_input')
        .setLabel('Новая биография')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setPlaceholder('Введите вашу новую биографию здесь...')
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
        bio: bio,
        background: profile.background
      });

      await interaction.reply({ content: '✅ Биография успешно обновлена!', ephemeral: true });
      return;
    }

    if (!interaction.isButton() && !interaction.isCommand()) return;

    if (interaction.isCommand() && interaction.commandName === 'balance') {
      const userProfile = await getUserProfile(interaction.user.id);
      if (!userProfile) return interaction.reply("Профиль не найден!");

      const balanceEmbed = new EmbedBuilder()
        .setTitle('Ваш баланс')
        .setDescription(`**Пользователь:** ${interaction.user.username}\n**ID:** ${interaction.user.id}\n**Баланс:** ${userProfile.balance}`)
        .setColor(0x0099FF);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Назад')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('send')
            .setLabel('Отправить')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('withdraw')
            .setLabel('Вывести')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('deposit')
            .setLabel('Пополнить')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('bank')
            .setLabel('Банк')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ embeds: [balanceEmbed], components: [row] });
      return;
    }

    if (interaction.isButton()) {
      const { getUser, updateUser } = require('../database');

      switch (interaction.customId) {
        case 'withdraw':
          const withdrawModal = new ModalBuilder()
            .setCustomId('withdraw_modal')
            .setTitle('Вывести деньги');

          const withdrawAmount = new TextInputBuilder()
            .setCustomId('withdraw_amount')
            .setLabel('Сумма для вывода')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          withdrawModal.addComponents(new ActionRowBuilder().addComponents(withdrawAmount));
          await interaction.showModal(withdrawModal);
          break;

        case 'deposit':
          try {
            const depositModal = new ModalBuilder()
              .setCustomId('deposit_modal')
              .setTitle('Пополнить баланс');

            const depositAmount = new TextInputBuilder()
              .setCustomId('deposit_amount')
              .setLabel('Сумма для пополнения')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder('Введите сумму для пополнения');

            const actionRow = new ActionRowBuilder().addComponents(depositAmount);
            depositModal.addComponents(actionRow);
            await interaction.showModal(depositModal);
          } catch (error) {
            console.error('Ошибка при показе модального окна депозита:', error);
            await interaction.reply({ 
              content: 'Произошла ошибка при обработке вашего запроса на пополнение. Пожалуйста, попробуйте снова.',
              ephemeral: true 
            });
          }
          break;

        case 'send':
          const sendModal = new ModalBuilder()
            .setCustomId('send_modal')
            .setTitle('Отправить деньги');

          const recipient = new TextInputBuilder()
            .setCustomId('recipient')
            .setLabel('ID получателя')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          const amount = new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('Сумма')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

          sendModal.addComponents(
            new ActionRowBuilder().addComponents(recipient),
            new ActionRowBuilder().addComponents(amount)
          );
          await interaction.showModal(sendModal);
          break;

        case 'back':
          await interaction.reply({content: 'Возвращение в главное меню...', ephemeral: true});
          break;

        case 'bank':
          await interaction.reply({content: 'Обновление баланса из банка...', ephemeral: true});
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
        await member.timeout(null);

        updatedEmbed.color = 0x000000;
        updatedEmbed.title = '✅ Пользователь одобрен';

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
        await interaction.reply({ content: 'Ошибка при одобрении пользователя.', ephemeral: true });
      }
    }

    if (action === 'kick') {
      try {
        await member.kick('Отказ в доступе: подозрительный аккаунт');

        updatedEmbed.color = 0x000000;
        updatedEmbed.title = '❌ Пользователь исключен';

        await interaction.update({
          embeds: [updatedEmbed],
          components: []
        });

        await interaction.followUp({
          content: `❌ ${member.user.tag} был исключен с сервера.`,
          ephemeral: false
        });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Ошибка при попытке исключения.', ephemeral: true });
      }
    }
  }
};
