const { SlashCommandBuilder } = require('discord.js');
const { setModeLecture } = require('../state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mode')
    .setDescription('🎛️ Choisit le mode de lecture : api, local ou mix')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Mode de lecture')
        .setRequired(true)
        .addChoices(
          { name: 'api', value: 'api' },
          { name: 'local', value: 'local' },
          { name: 'mix', value: 'mix' }
        )
    ),
  async execute(interaction) {
  const mode = interaction.options.getString('mode');
  if (!mode) {
    return interaction.reply({ content: '⚠️ Mode invalide ou manquant.', ephemeral: true });
  }

  setModeLecture(mode);
  await interaction.reply(`🎶 Le mode est maintenant : ${mode.toUpperCase()}`);
  }
};
