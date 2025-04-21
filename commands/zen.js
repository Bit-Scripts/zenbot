require('dotenv').config();
const { playRandomMusic } = require('../player');
const { setConnection, setTextChannel } = require('../state');

const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zen')
    .setDescription('Lance une musique zen en aléatoire dans ton salon vocal'),

  async execute(interaction) {
    const VOCAL_CHANNEL_ID = process.env.VOCAL_CHANNEL_ID;

    try {
      const guild = interaction.guild;
      const channel = guild.channels.cache.get(VOCAL_CHANNEL_ID);

      if (!channel || channel.type !== 2) {
        console.error("❌ Le salon vocal spécifié est introuvable ou n’est pas un salon vocal.");
        return interaction.reply({ content: "❌ Salon vocal introuvable.", ephemeral: true });
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      setConnection(connection);
      setTextChannel(interaction.channel);

      const botAvatarURL = interaction.client.user.displayAvatarURL();
      playRandomMusic(connection, interaction.channel, botAvatarURL);

      await interaction.reply("🧘‍♂️ ZenBot connecté au salon vocal.");

    } catch (err) {
      console.error("❌ Erreur dans /zen :", err);
      await interaction.reply({ content: "⚠️ Erreur lors de la tentative de connexion.", ephemeral: true });
    }
  }
};

