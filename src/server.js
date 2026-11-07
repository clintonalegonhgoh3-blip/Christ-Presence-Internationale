// Point d'entrée : lance le serveur web.
//   npm start   → mode normal
//   npm run dev → redémarre automatiquement quand un fichier change
const config = require('./config');
const { creerApp } = require('./app');

creerApp().listen(config.port, () => {
  console.log(`Site disponible sur http://localhost:${config.port}`);
});
