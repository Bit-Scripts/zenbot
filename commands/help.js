const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('ℹ️ Liste les commandes disponibles'),

  async execute(interaction) {
    await interaction.reply({
      content:
`🧘‍♂️ **Bienvenue dans l’univers sonore de ZenBot**

📜 **Voici la liste des commandes disponibles :**

\`\`\`
Commande    | Description
------------|-----------------------------------------
/zen        | ▶️ Lance une musique zen aléatoire
/next       | ⏭️ Passe à la piste suivante
/start      | ▶️ Relance la musique (même après un stop)
/pause      | ⏸️ Met la musique en pause
/stop       | 🛑 Arrête la lecture et déconnecte le bot
/mode       | 🎛️ Change entre API et lecture locale
/info       | 🧘 Affiche la piste actuelle
/help       | ℹ️ Affiche l'aide
\`\`\`

🌀 Besoin d'aide ? Tape /help à tout moment. Respire, et laisse la musique faire le reste.`,
      ephemeral: true
    });
  }
};
