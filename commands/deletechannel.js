// commands/deletechannel.js
module.exports = {
  name: "deletechannel",
  description: "Deleta todos os canais com o mesmo nome.",
  async execute(message, args) {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply("Você não tem permissão para deletar canais.");
    }

    const targetName = args[0] ? args.join(" ") : message.channel.name;

    const matchingChannels = message.guild.channels.cache.filter(
      (channel) => channel.name === targetName
    );

    if (matchingChannels.size === 0) {
      return message.reply(`Nenhum canal chamado **${targetName}** encontrado.`);
    }

    let deletedCount = 0;
    for (const channel of matchingChannels.values()) {
      try {
        await channel.delete(`Comando executado por ${message.author.tag}`);
        deletedCount++;
      } catch (err) {
        console.error(`Erro ao deletar o canal ${channel.name}:`, err);
      }
    }

    message.reply(`Foram deletados ${deletedCount} canal(is) chamado(s) **${targetName}**.`);
  }
};