let lastEmbedMessage = null;
let connection = null;
let textChannel = null;
let isPlaying = false;
let modeLecture = 'mix';

module.exports = {
  // Gestion de la connexion vocale
  getConnection: () => connection,
  setConnection: (c) => { connection = c; },

  // Gestion du salon texte
  getTextChannel: () => textChannel,
  setTextChannel: (t) => { textChannel = t; },

  // Gestion de l'état de lecture
  getIsPlaying: () => isPlaying,
  setIsPlaying: (val) => { isPlaying = val; },

  // Gestion du dernier message embed envoyé
  getLastEmbedMessage: () => lastEmbedMessage,
  setLastEmbedMessage: (msg) => { lastEmbedMessage = msg; },

  // Gestion des sources de musique : 'local', 'mix' ('local' + 'api') ou 'api'
  getModeLecture: () => modeLecture,
  setModeLecture: (mode) => { modeLecture = mode; }
};

