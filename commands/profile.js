const { Canvas } = require('canvas');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'profile',
  description: 'Displays the user profile with dynamic level icon',
  async execute(interaction) {
    const user = interaction.user;
    const userLevel = 10; // You can fetch the level dynamically
    const levelColor = `hsl(${(userLevel * 30) % 360}, 100%, 50%)`; // Dynamic color based on user level
    
    // Create canvas to draw level icon
    const canvas = Canvas.createCanvas(128, 128);
    const ctx = canvas.getContext('2d');

    // Draw gradient circle for level icon
    const gradient = ctx.createRadialGradient(64, 64, 50, 64, 64, 80);
    gradient.addColorStop(0, '#ffcc00');
    gradient.addColorStop(1, levelColor);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Add the level number text to the center
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(userLevel, 64, 64);

    // Convert canvas to image buffer
    const buffer = canvas.toBuffer();

    // Create the profile embed
    const profileEmbed = new MessageEmbed()
      .setColor('#9a46ca')
      .setTitle('Profile')
      .setDescription(`Here is your profile, ${user.username}!`)
      .setThumbnail('attachment://level-icon.png') // Attach the generated image
      .addFields(
        { name: '<:staff:1362591340004643006> Staff', value: 'Your position as staff.', inline: true },
        { name: '<:user:1362591307477811220> User', value: `Level: ${userLevel}`, inline: true },
        { name: '<:reason:1362591282295472249> Reason', value: 'Profile created.', inline: true }
      );

    // Create a row for buttons (optional)
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('profile_button')
          .setLabel('View Full Profile')
          .setStyle('PRIMARY')
      );

    // Send the embed with the canvas image attached
    await interaction.reply({
      content: `Here is your profile, ${user.username}!`,
      embeds: [profileEmbed],
      files: [{ attachment: buffer, name: 'level-icon.png' }],
      components: [row],
    });
  }
};
