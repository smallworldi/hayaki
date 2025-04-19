    const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { getUserProfile, updateUserProfile } = require('../database');

    module.exports = {
      name: Events.InteractionCreate,
      async execute(interaction) {
    if (interaction.customId === 'change_bio') {
      const modal = new ModalBuilder()
        .setCustomId('bio_modal')
        .setTitle('Change Your Bio');

      const bioInput = new TextInputBuilder()
        .setCustomId('bio_input')
        .setLabel('New Bio')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setPlaceholder('Enter your new bio here...')
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
