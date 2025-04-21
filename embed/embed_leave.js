const { EmbedBuilder } = require('discord.js');

function createFarewellEmbed(botAvatarURL) {
  return new EmbedBuilder()
    .setColor(0x00A89D)
    .setTitle('🕊️ ZenBot se retire')
    .setDescription("Le bot s'est déconnecté du salon vocal.\nReviens quand tu veux pour un moment de calme 🍃")
    .setTimestamp()
    .setFooter({ text: 'ZenBot - Harmonie intérieure', iconURL: botAvatarURL });
}

module.exports = { createFarewellEmbed };
