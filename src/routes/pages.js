// Routes des pages du site.
// Responsable : BACKEND.
const express = require('express');
const { PAGES } = require('../pages');
const { donneesPage } = require('../rendu');

const routeur = express.Router();

for (const page of PAGES) {
  routeur.get(page.chemin, (req, res, next) => {
    try {
      const extra = {};
      // Après un envoi sans JavaScript, /contact?envoye=1 affiche la confirmation.
      if (page.id === 'contact' && req.query.envoye === '1') {
        extra.formulaire = { envoye: true, erreurs: {}, valeurs: {} };
      }
      res.render(page.vue, donneesPage(page.id, { extra }));
    } catch (erreur) {
      next(erreur);
    }
  });
}

module.exports = routeur;
