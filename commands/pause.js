const { SlashCommandBuilder } = require('discord.js');
const { player } = require('../player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Met en pause la musique'),

  async execute(interaction) {
    const success = player.pause();
    await interaction.reply(success ? '⏸️ Musique mise en pause.' : '❌ Aucune musique en cours ou déjà en pause.');
  }
};
