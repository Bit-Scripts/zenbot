require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('zen')
    .setDescription('▶️ Lance une musique zen en aléatoire dans ton salon vocal'),

  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('🛑 Arrête la musique en cours et déconnecte le bot du salon vocal'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('🧘 Affiche la piste en cours et son origine'),

  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸️ Met en pause la musique'),

  new SlashCommandBuilder()
    .setName('start')
    .setDescription('▶️ Reprend la musique'),

  new SlashCommandBuilder()
    .setName('mode')
    .setDescription('🎛️ Choisir entre API ou local')
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

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('ℹ️ Liste les commande disponible'),

  new SlashCommandBuilder()
    .setName('next')
    .setDescription('⏭️ Passe à la piste suivante (tu es dessus !)')
].map(cmd => cmd.toJSON());


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_DISCORD_BOT);

(async () => {
  try {
    console.log('🔄 Enregistrement des slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands enregistrées avec succès !');
  } catch (error) {
    console.error(error);
  }
})();
