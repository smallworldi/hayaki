
const { getUserFullProfile, updateUserProfile } = require('../database');

module.exports = {
  name: 'setbadge',
  async execute(message, args) {
    if (!args[0]) {
      return message.reply('❌ Por favor, forneça um emoji personalizado.');
    }

    // Extrair o ID do emoji do formato <:nome:id>
    const emojiMatch = args[0].match(/<:.+:(\d+)>/);
    if (!emojiMatch) {
      return message.reply('❌ Por favor, use um emoji personalizado válido.');
    }

    const emojiId = emojiMatch[1];
    const profile = await getUserFullProfile(message.author.id);
    
    // Inicializar ou atualizar badges
    let badges = profile.badges ? JSON.parse(profile.badges) : [];
    if (!Array.isArray(badges)) badges = [];
    
    // Adicionar novo badge se não existir
    if (!badges.includes(emojiId)) {
      badges.push(emojiId);
    }

    // Atualizar perfil
    profile.badges = JSON.stringify(badges);
    await updateUserProfile(message.author.id, profile);

    message.reply('✅ Badge adicionado com sucesso!');
  }
};
