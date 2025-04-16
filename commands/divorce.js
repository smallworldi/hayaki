const { getUserFullProfile, updateUserProfile } = require('../database'); // Funções para atualizar o perfil no banco de dados

module.exports = {
  name: 'divorce',
  aliases: ['divorciar'],
  async prefixExecute(message) {
    const profile = await getUserFullProfile(message.author.id);
    if (!profile.married_with) {
      return message.reply('Você não está casado(a)!');
    }


    const spouse = profile.married_with;


    await updateUserProfile(message.author.id, { married_with: null });
    await updateUserProfile(spouse.id, { married_with: null });

    message.channel.send(`${message.author.username} e ${spouse} se divorciaram.`);
  }
};