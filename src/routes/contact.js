// Réception des messages du formulaire de contact.
// Responsable : BACKEND.
//
// Deux façons d'envoyer un message :
//  - POST /api/contact (JSON) : utilisé par public/js/formulaire-contact.js,
//    la page affiche la confirmation sans se recharger ;
//  - POST /contact (formulaire classique) : fonctionne même si JavaScript est
//    désactivé ; le serveur redirige vers /contact?envoye=1.
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const config = require('../config');
const { validerMessage } = require('../../shared/validation-contact');
const { enregistrerMessage } = require('../services/messages');
const { notifierNouveauMessage } = require('../services/notification');
const { donneesPage } = require('../rendu');

const MESSAGE_LIMITE = 'Vous avez envoyé plusieurs messages en peu de temps. Réessayez dans quelques minutes.';

function creerRoutesContact(options = {}) {
  const routeur = express.Router();
  const fichierMessages = options.fichierMessages || config.fichierMessages;

  // Anti-abus : nombre de messages limité par adresse IP.
  const limiteur = rateLimit({
    windowMs: options.fenetreLimiteMs || config.fenetreLimiteMs,
    limit: options.limiteMessages || config.limiteMessages,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler(req, res) {
      if (req.path.startsWith('/api/')) {
        return res.status(429).json({ ok: false, erreur: MESSAGE_LIMITE });
      }
      return res.status(429).render(
        'contact',
        donneesPage('contact', { extra: { formulaire: { envoye: false, erreurs: { general: MESSAGE_LIMITE }, valeurs: req.body || {} } } })
      );
    },
  });

  // Traite un message. Renvoie { statut, erreurs, valeurs }.
  async function traiterMessage(corps = {}) {
    // Piège à robots : ce champ est caché aux humains. S'il est rempli, on fait
    // comme si tout allait bien, sans rien enregistrer.
    if (corps.site_web) {
      return { statut: 'ignore' };
    }
    const { valide, erreurs, valeurs } = validerMessage(corps);
    if (!valide) return { statut: 'invalide', erreurs, valeurs };

    const entree = await enregistrerMessage(valeurs, fichierMessages);
    await notifierNouveauMessage(entree);
    return { statut: 'enregistre' };
  }

  routeur.post('/api/contact', limiteur, async (req, res, next) => {
    try {
      const resultat = await traiterMessage(req.body);
      if (resultat.statut === 'invalide') {
        return res.status(400).json({ ok: false, erreurs: resultat.erreurs });
      }
      return res.status(201).json({ ok: true });
    } catch (erreur) {
      next(erreur);
    }
  });

  routeur.post('/contact', limiteur, async (req, res, next) => {
    try {
      const resultat = await traiterMessage(req.body);
      if (resultat.statut === 'invalide') {
        return res.status(400).render(
          'contact',
          donneesPage('contact', { extra: { formulaire: { envoye: false, erreurs: resultat.erreurs, valeurs: resultat.valeurs } } })
        );
      }
      return res.redirect(303, '/contact?envoye=1#formulaire');
    } catch (erreur) {
      next(erreur);
    }
  });

  return routeur;
}

module.exports = { creerRoutesContact };
