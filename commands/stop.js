const { SlashCommandBuilder } = require('discord.js');
const { getConnection } = require('../state');
const { player } = require('../player');
const { setConnection, setTextChannel, setIsPlaying } = require('../state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('🛑 Arrête la musique et déconnecte le bot'),

  async execute(interaction) {
    const connection = getConnection();
    if (!connection) {
      return interaction.reply({ content: "❌ Le bot n’est pas connecté.", ephemeral: true });
    }

    player.stop();
    connection.destroy();
    setConnection(null);
    setTextChannel(null);
    setIsPlaying(false);

    await interaction.reply("🛑 Musique arrêtée et bot déconnecté.");
  }
};

