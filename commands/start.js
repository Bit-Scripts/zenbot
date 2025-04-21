const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { setConnection, setTextChannel, getConnection } = require('../state');
const { playRandomMusic } = require('../player');

const VOCAL_CHANNEL_ID = process.env.VOCAL_CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('▶️ Relance une musique zen si le bot est connecté'),

  async execute(interaction) {
    const guild = interaction.guild;
    let connection = getConnection();

    if (!connection) {
      const channel = guild.channels.cache.get(VOCAL_CHANNEL_ID);
      if (!channel || channel.type !== 2) {
        return interaction.reply({ content: "⚠️ Salon vocal introuvable.", ephemeral: true });
      }

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      setConnection(connection);
      setTextChannel(interaction.channel);
    }

    const botAvatarURL = interaction.client.user.displayAvatarURL();
    playRandomMusic(connection, interaction.channel, botAvatarURL);
    await interaction.reply("▶️ Musique relancée !");
  }
};


