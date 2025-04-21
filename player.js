// ✅ VERSION CORRIGÉE DU FICHIER `player.js`
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createNowPlayingEmbed } = require('./embed/embed_player');
const {
  getConnection,
  getTextChannel,
  getIsPlaying,
  setIsPlaying,
  getModeLecture
} = require('./state');
require('dotenv').config();

const MUSIC_API_KEY = process.env.API_MUSIC_KEY;
const MUSIC_FOLDER = './musique';
const VOIX_INFO = path.join('./alerte', 'voix_info.mp3');

let progressInterval = null;
let duration = 240; // Durée par défaut si inconnue
let elapsed = 0;
let lastEmbedMessage = null;
let alreadyWarnedAboutApiError = false;
let currentTrack = null;

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.floor(metadata.format.duration)); // durée en secondes
    });
  });
}

function setLastEmbedMessage(msg) {
  lastEmbedMessage = msg;
}

function deleteLastEmbedMessage() {
  if (lastEmbedMessage) {
    try {
      lastEmbedMessage.delete();
    } catch (e) {
      console.warn("⚠️ Impossible de supprimer le message embed :", e.message);
    }
    lastEmbedMessage = null;
  }
}

const player = createAudioPlayer();
let infoInterval = null;

async function fetchZenSoundUrl() {
  const url = `https://freesound.org/apiv2/search/text/?query=meditation&fields=id,name,previews,duration&filter=duration:[30 TO 300]&sort=score&token=${MUSIC_API_KEY}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ZenBot/1.0 (contact@example.com)'
    }
  });
  const data = await response.json();
  if (!data.results || data.results.length === 0) throw new Error("Aucun résultat trouvé");
  const randomSound = data.results[Math.floor(Math.random() * data.results.length)];
  return {
    name: randomSound.name,
    url: randomSound.previews['preview-lq-mp3'],
    duration: Math.floor(randomSound.duration)
  };
}

function clearProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  elapsed = 0;
}

function getRandomTrack() {
  const files = fs.readdirSync(MUSIC_FOLDER).filter(f => f.endsWith('.mp3') && f !== 'voix_info.mp3');
  if (files.length === 0) return null;
  const track = files[Math.floor(Math.random() * files.length)];
  return {
    name: track,
    path: path.join(MUSIC_FOLDER, track)
  };
}

async function playRandomMusic(connection, textChannel, botAvatarURL) {
  if (getIsPlaying()) return;
  setIsPlaying(true);
  clearInterval(infoInterval);

  const mode = getModeLecture();

  if (!connection) {
    console.warn("❌ Aucun salon vocal actif. Connexion absente.");
    if (textChannel) textChannel.send("❌ Le bot n'est pas connecté à un salon vocal.");
    setIsPlaying(false);
    return;
  }

  try {
    let resource, name;
    let triedAPI = false;

    if (mode === 'api' || mode === 'mix') {
      try {
        const sound = await fetchZenSoundUrl();
        const stream = await fetch(sound.url).then(res => res.body);
        resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
        name = `[API] ${sound.name}`;
        duration = sound.duration;
        triedAPI = true;
      } catch (e) {
        if (mode === 'api') throw e;
        if (textChannel) textChannel.send("⚠️ API inaccessible, utilisation de la musique locale.");
        const local = getRandomTrack();
        if (!local) throw new Error("Aucune musique locale trouvée");
        resource = createAudioResource(local.path);
        name = `[Local] ${local.name}`;
        duration = await getAudioDuration(local.path);
      }
    } else {
      const local = getRandomTrack();
      if (!local) throw new Error("Aucune musique locale trouvée");
      resource = createAudioResource(local.path);
      name = `[Local] ${local.name}`;
      duration = await getAudioDuration(local.path);
    }

    elapsed = 0;
    connection.subscribe(player);
    player.play(resource);

    currentTrack = {
      name,
      source: triedAPI ? "API" : "Locale",
      elapsed,
      duration
    };

    if (textChannel) {
      const { embed, file } = createNowPlayingEmbed(name, triedAPI ? "API" : "Locale", botAvatarURL, elapsed, duration);
      const sent = await textChannel.send({ embeds: [embed], files: [file] });
      setLastEmbedMessage(sent);

      progressInterval = setInterval(async () => {
        elapsed += 20;
        if (elapsed >= duration) {
          clearInterval(progressInterval);
          return;
        }
        const { embed } = createNowPlayingEmbed(name, triedAPI ? "API" : "Locale", botAvatarURL, elapsed, duration);
        try {
          await sent.edit({ embeds: [embed] });
        } catch (err) {
          clearInterval(progressInterval);
        }
      }, 20000);
    }
  } catch (err) {
    console.error('❌ Erreur de lecture zen :', err.message);

    const infoResource = createAudioResource(VOIX_INFO);
    console.warn('🔁 Lecture répétée de voix_info.mp3');
    connection.subscribe(player);
    player.play(infoResource);

    const local = getRandomTrack();
    if (!local) {
      currentTrack = null;
      throw new Error("Aucune musique locale trouvée");
    }
    const fallbackResource = createAudioResource(local.path);
    const name = `[Local fallback] ${local.name}`;
    duration = await getAudioDuration(local.path);
    connection.subscribe(player);
    player.play(fallbackResource);
  }

  if (textChannel && !alreadyWarnedAboutApiError) {
    textChannel.send("⚠️ API inaccessible, utilisation de la musique locale.");
    alreadyWarnedAboutApiError = true;
  }

  player.removeAllListeners(AudioPlayerStatus.Idle);
  player.on(AudioPlayerStatus.Idle, () => {
    clearProgress();
    setIsPlaying(false);
    if (getConnection() && getConnection().state.status !== "destroyed") {
      setTimeout(() => {
        playRandomMusic(getConnection(), getTextChannel(), botAvatarURL);
      }, 10000);
    }
  });
}

let lastFarewellMessage = null;

function setLastFarewellMessage(msg) {
  lastFarewellMessage = msg;
}

function deleteLastFarewellMessage() {
  if (lastFarewellMessage) {
    try {
      lastFarewellMessage.delete();
    } catch (e) {
      console.warn("⚠️ Impossible de supprimer le message d'au revoir :", e.message);
    }
    lastFarewellMessage = null;
  }
}

module.exports = {
  playRandomMusic,
  player,
  clearProgress,
  setLastEmbedMessage,
  deleteLastEmbedMessage,
  setLastFarewellMessage,
  deleteLastFarewellMessage,
  currentTrack
};
