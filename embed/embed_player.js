const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

function generateProgressBar(elapsed, duration) {
  const totalBlocks = 12;
  const progress = Math.floor((elapsed / duration) * totalBlocks);
  const bar = '▓'.repeat(progress) + '░'.repeat(totalBlocks - progress);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return `🔊 ${bar} ${formatTime(elapsed)} / ${formatTime(duration)}`;
}

function createNowPlayingEmbed(title, origin, botAvatarURL, elapsed = 0, duration = 240) {
  const file = new AttachmentBuilder(path.join(__dirname, '../image/zen-bot.png'));

  const embed = new EmbedBuilder()
    .setTitle('🎵 En cours de lecture')
    .addFields(
      { name: 'Piste', value: title, inline: true },
      { name: 'Origine', value: origin, inline: true },
      { name: 'Progression', value: generateProgressBar(elapsed, duration) }
    )
    .setImage('attachment://zen-bot.png')
    .setTimestamp()
    .setFooter({ text: 'ZenBot - Harmonie intérieure', iconURL: botAvatarURL });

  return { embed, file };
}

module.exports = { createNowPlayingEmbed, generateProgressBar };
