const { EmbedBuilder } = require('discord.js');

function createJoinEmbed(botAvatarURL) {
  return new EmbedBuilder()
    .setColor(0x00D084)
    .setTitle('🌅 ZenBot est de retour')
    .setDescription("Une nouvelle session de sérénité commence.\nRespire profondément et laisse-toi porter 🍃")
    .setTimestamp()
    .setFooter({ text: 'ZenBot - Harmonie intérieure', iconURL: botAvatarURL });
}

module.exports = { createJoinEmbed };

