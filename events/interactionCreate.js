    const { Events } = require('discord.js');

    module.exports = {
      name: Events.InteractionCreate,
      async execute(interaction) {
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
