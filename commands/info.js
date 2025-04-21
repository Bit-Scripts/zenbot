const { SlashCommandBuilder } = require('discord.js');
const { currentTrack } = require('../player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('🧘 Affiche la piste en cours et son origine'),

  async execute(interaction) {
    if (currentTrack?.name) {
      const progress = currentTrack.elapsed && currentTrack.duration
        ? ` (${currentTrack.elapsed}s / ${currentTrack.duration}s)`
        : '';

      await interaction.reply(
        `🎵 Piste en cours : **${currentTrack.name}**\n🎚️ Origine : *${currentTrack.source}*${progress}`
      );
    } else {
      await interaction.reply('❌ Aucune musique en cours de lecture.');
    }
  }
};
