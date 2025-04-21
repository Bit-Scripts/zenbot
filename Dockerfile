# Utilise une image officielle Node.js légère
FROM node:18-alpine

# Installe ffmpeg avec apk (et ses dépendances)
RUN apk add --no-cache ffmpeg

# Crée un répertoire de travail
WORKDIR /app

# Copie uniquement les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances de production (et pm2 globalement)
RUN npm install --production && npm install -g pm2

# Copie le reste du projet
COPY . .

# Expose un port fictif (utile en debug, pas obligatoire ici)
EXPOSE 3000

# Démarre avec PM2 en mode runtime
CMD ["pm2-runtime", "index.js", "--name", "ZenBot"]

