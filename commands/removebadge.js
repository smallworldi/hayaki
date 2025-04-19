const { getUserFullProfile, updateUserProfile } = require('../database');

module.exports = {
  name: 'removebadge',
  async execute(message, args) {
    if (!args[0]) {
      return message.reply('❌ Por favor, forneça um emoji personalizado para remover.');
    }

    // Extrair o ID do emoji do formato <:nome:id>
    const emojiMatch = args[0].match(/<:.+:(\d+)>/);
    if (!emojiMatch) {
      return message.reply('❌ Por favor, use um emoji personalizado válido.');
    }

    const emojiId = emojiMatch[1];
    const profile = await getUserFullProfile(message.author.id);

    // Inicializar badges
    let badges = profile.badges ? JSON.parse(profile.badges) : [];
    if (!Array.isArray(badges)) badges = [];

    // Verifica se o badge existe
    if (!badges.includes(emojiId)) {
      return message.reply('❌ Este badge não está no seu perfil.');
    }

    // Remove o badge
    badges = badges.filter(id => id !== emojiId);

    // Atualiza perfil
    profile.badges = JSON.stringify(badges);
    await updateUserProfile(message.author.id, profile);

    message.reply('✅ Badge removido com sucesso!');
  }
};
