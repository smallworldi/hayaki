const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generateimage')
    .setDescription('Gera uma imagem com base em uma descrição')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Descreva a imagem que deseja gerar')
        .setRequired(true)
    ),

  async execute(interaction) {
    const prompt = interaction.options.getString('prompt');
    await interaction.deferReply();

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });

      const imageUrl = response.data[0].url;

      await interaction.editReply({
        content: `Imagem gerada para: **${prompt}**`,
        files: [imageUrl]
      });

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      await interaction.editReply({
        content: 'Houve um erro ao gerar a imagem. Tente novamente mais tarde.'
      });
    }
  }
};