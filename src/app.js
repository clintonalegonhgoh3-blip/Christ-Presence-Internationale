// Application Express.
// Responsable : BACKEND.
// L'application est créée par une fonction pour que les tests puissent en
// lancer une copie avec leurs propres réglages (fichier de messages temporaire, etc.).
const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const routesPages = require('./routes/pages');
const { creerRoutesContact } = require('./routes/contact');
const { donneesPage } = require('./rendu');

function creerApp(options = {}) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', config.dossierVues);
  app.disable('x-powered-by');

  // En-têtes de sécurité HTTP (dont la politique de sécurité du contenu, CSP).
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:'],
          'media-src': ["'self'", 'https:'],
          'frame-src': ['https://www.openstreetmap.org'],
          'form-action': ["'self'"],
          'upgrade-insecure-requests': config.enProduction ? [] : null,
        },
      },
    })
  );

  app.use(express.static(config.dossierPublic));
  app.use('/js/shared', express.static(config.dossierPartage));
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use(express.json({ limit: '20kb' }));

  app.use(routesPages);
  app.use(creerRoutesContact(options));

  // Page introuvable
  app.use((req, res) => {
    res.status(404).render('404', donneesPage('accueil', { extra: { titrePage: 'Page introuvable', pageActive: null } }));
  });

  // Erreur serveur
  // eslint-disable-next-line no-unused-vars
  app.use((erreur, req, res, next) => {
    console.error(erreur);
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ ok: false, erreur: 'Une erreur est survenue sur le serveur. Réessayez plus tard.' });
    }
    return res.status(500).send('Une erreur est survenue sur le serveur. Réessayez plus tard.');
  });

  return app;
}

module.exports = { creerApp };
