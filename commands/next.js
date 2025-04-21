require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const {
  joinVoiceChannel,
  getVoiceConnection,
} = require('@discordjs/voice');
const { setConnection, setTextChannel } = require('../state');
const { player, playRandomMusic } = require('../player');

const VOCAL_CHANNEL_ID = process.env.VOCAL_CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('next')
    .setDescription('⏭️ Passer à la musique suivante'),

  async execute(interaction) {
    const guild = interaction.guild;
    const voiceChannel = guild.channels.cache.get(VOCAL_CHANNEL_ID);

    if (!voiceChannel || voiceChannel.type !== 2) {
      return interaction.reply({
        content: "⚠️ Salon vocal introuvable ou incorrect.",
        ephemeral: true
      });
    }

    // Vérifie si le bot est déjà connecté
    let connection = getVoiceConnection(guild.id);

    if (!connection) {
      try {
        connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        setConnection(connection);
        setTextChannel(interaction.channel);

      } catch (err) {
        console.error("❌ Échec de connexion au salon vocal :", err);
        return interaction.reply({
          content: "❌ Impossible de connecter le bot au salon vocal.",
          ephemeral: true
        });
      }
    }

    player.stop();
    await interaction.reply("⏭️ Musique suivante en cours de lecture...");

    const botAvatarURL = interaction.client.user.displayAvatarURL();
    playRandomMusic(connection, interaction.channel, botAvatarURL);
  }
};
