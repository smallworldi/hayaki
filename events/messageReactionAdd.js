
module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    try {
      if (user.bot) return;

      // Handle partial reactions
      if (reaction.partial) {
        try {
          await reaction.fetch();
        } catch (error) {
          console.error('Error fetching reaction:', error);
          return;
        }
      }

      const roleMap = {
        '1361786039789817896': '1361779231960334386', // CS2
        '1361785889029623941': '1361780390917968044', // Dota2
        '1361785825129533651': '1361782351025410420', // Valorant
        '1361785731860795622': '1361783127592403054', // LoL
        '1361785655721459853': '1361784305352835093', // News1
        '1361785631017140265': '1361785219971154122', // News2
      };

      const roleId = roleMap[reaction.emoji.id];
      if (!roleId) return;

      const guild = reaction.message.guild;
      const member = await guild.members.fetch(user.id);

      if (!member) {
        console.error('Member not found');
        return;
      }

      await member.roles.add(roleId);
      console.log(`Added role ${roleId} to user ${user.tag}`);

    } catch (error) {
      console.error('Error in messageReactionAdd:', error);
    }
  },
};
