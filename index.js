const { Client, GatewayIntentBits, Events } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus
} = require('@discordjs/voice');

const fs = require('fs');
const path = require('path');
const {
  playRandomMusic,
  clearProgress,
  deleteLastEmbedMessage,
  setLastFarewellMessage,
  deleteLastFarewellMessage
} = require('./player');

const {
  setIsPlaying,
  setConnection,
  setTextChannel,
  getConnection,
  setModeLecture,
  getModeLecture
} = require('./state');

const { createFarewellEmbed } = require('./embed/embed_leave');
const { createJoinEmbed } = require('./embed/join_embed');

require('dotenv').config();

const TOKEN = process.env.TOKEN_DISCORD_BOT;
const VOCAL_CHANNEL_ID = process.env.VOCAL_CHANNEL_ID;
const TEXT_CHANNEL_ID = process.env.TEXT_CHANNEL_ID;

function resolveTextChannel(guild, voiceChannel) {
  if (TEXT_CHANNEL_ID) {
    const fixed = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (fixed) {
      console.log(`📌 Salon texte fixe trouvé : #${fixed.name}`);
      return fixed;
    }
  }

  const voiceName = voiceChannel.name.toLowerCase();
  return guild.channels.cache.find(channel =>
    channel.type === 0 &&
    channel.name.toLowerCase().includes(voiceName)
  );
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  const avatar = client.user.displayAvatarURL();

  try {
    const guild = client.guilds.cache.first();
    const channel = guild.channels.cache.get(VOCAL_CHANNEL_ID);

    if (!channel || channel.type !== 2) {
      console.error("❌ Le salon vocal spécifié est introuvable ou n’est pas un salon vocal.");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    setConnection(connection);
    setModeLecture('mix'); // mode par défaut au démarrage

    connection.on(VoiceConnectionStatus.Ready, () => {
      deleteLastFarewellMessage();
      const textChannel = resolveTextChannel(channel.guild, channel);
      setTextChannel(textChannel);

      if (textChannel) {
        const welcomeEmbed = createJoinEmbed(avatar);
        textChannel.send({ embeds: [welcomeEmbed] });
      }

      playRandomMusic(getConnection(), textChannel, avatar);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.warn("🚪 Bot déconnecté du salon vocal");
      clearProgress();
      deleteLastEmbedMessage();
      setIsPlaying(false);

      const textChannel = resolveTextChannel(channel.guild, channel);
      if (textChannel) {
        const farewellEmbed = createFarewellEmbed(avatar);
        const sent = await textChannel.send({ embeds: [farewellEmbed] });
        setLastFarewellMessage(sent);
      }
    });

    const player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      playRandomMusic(getConnection(), resolveTextChannel(channel.guild, channel), avatar);
    });
  } catch (err) {
    console.error("Erreur lors de la connexion automatique :", err);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erreur avec la commande /${interaction.commandName} :`, error);
    await interaction.reply({ content: '⚠️ Une erreur est survenue pendant l’exécution de la commande.', ephemeral: true });
  }
});

client.login(TOKEN);
