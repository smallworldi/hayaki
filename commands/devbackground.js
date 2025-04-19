
const { getUserFullProfile, updateUserProfile } = require('../database');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'devbackground',
  async prefixExecute(message, args) {
    const { isDeveloper } = require('../utils/developers');

    if (!isDeveloper(message.author.id)) {
      return message.reply('Apenas desenvolvedores podem usar este comando.');
    }

    const targetUser = message.mentions.users.first();
    const backgroundName = args[1];

    if (!targetUser || !backgroundName) {
      return message.reply('Use: !devbackground @usuario nome_do_arquivo');
    }

    const backgroundPath = path.join(__dirname, '..', 'assets', 'background', backgroundName);

    if (!fs.existsSync(backgroundPath)) {
      return message.reply('Background não encontrado! Certifique-se que o arquivo existe na pasta assets/background.');
    }

    const userProfile = await getUserFullProfile(targetUser.id);
    
    await updateUserProfile(targetUser.id, {
      ...userProfile,
      background: backgroundName
    });

    message.reply(`✅ Background de ${targetUser.tag} alterado para ${backgroundName}`);
  }
};
