
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
        '1363604624011165867': '1361779231960334386', // CS2
        '1363604586056782017': '1361780390917968044', // Dota2
        '1363604538397032660': '1361782351025410420', // Valorant
        '1363604498987090211': '1361783127592403054', // LoL
        '1363604464409383053': '1361784305352835093', // News1
        '1363604418347536465': '1361785219971154122', // News2
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
