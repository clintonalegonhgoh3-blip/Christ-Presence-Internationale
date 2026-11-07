// Configuration centrale du serveur.
// Responsable : BACKEND. Les valeurs peuvent être surchargées par des variables
// d'environnement (voir .env.example).
const path = require('path');

const racine = path.join(__dirname, '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  enProduction: process.env.NODE_ENV === 'production',
  racine,
  dossierVues: path.join(racine, 'views'),
  dossierPublic: path.join(racine, 'public'),
  dossierPartage: path.join(racine, 'shared'),
  dossierContenu: process.env.CONTENU_DIR || path.join(racine, 'content'),
  fichierMessages: process.env.MESSAGES_FILE || path.join(racine, 'data', 'messages.json'),
  // Nombre maximal de messages de contact par adresse IP sur la fenêtre ci-dessous.
  limiteMessages: Number(process.env.LIMITE_MESSAGES) || 5,
  fenetreLimiteMs: 15 * 60 * 1000,
};
