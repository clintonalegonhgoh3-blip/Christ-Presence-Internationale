// Règles de validation du formulaire de contact.
// CE FICHIER EST PARTAGÉ : il est utilisé par le serveur (require) ET par le
// navigateur (<script src="/js/shared/validation-contact.js">). Une seule source
// de vérité : modifier une règle ici la change partout.
// Responsables : BACKEND (règles) + TESTS (tests/validation.test.js).
(function (racine, fabrique) {
  if (typeof module === 'object' && module.exports) {
    module.exports = fabrique();
  } else {
    racine.ValidationContact = fabrique();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIMITES = {
    nomMin: 2,
    nomMax: 100,
    emailMax: 254,
    messageMin: 10,
    messageMax: 3000,
  };

  var MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function texte(valeur) {
    return valeur === undefined || valeur === null ? '' : String(valeur).trim();
  }

  function validerMessage(donnees) {
    donnees = donnees || {};
    var valeurs = {
      nom: texte(donnees.nom),
      email: texte(donnees.email),
      message: texte(donnees.message),
    };
    var erreurs = {};

    if (valeurs.nom.length < LIMITES.nomMin) {
      erreurs.nom = 'Indiquez votre nom.';
    } else if (valeurs.nom.length > LIMITES.nomMax) {
      erreurs.nom = 'Votre nom ne doit pas dépasser ' + LIMITES.nomMax + ' caractères.';
    }

    if (!valeurs.email) {
      erreurs.email = 'Indiquez votre adresse courriel.';
    } else if (valeurs.email.length > LIMITES.emailMax || !MOTIF_EMAIL.test(valeurs.email)) {
      erreurs.email = 'Vérifiez votre adresse courriel (exemple : prenom.nom@exemple.fr).';
    }

    if (!valeurs.message) {
      erreurs.message = 'Écrivez votre message.';
    } else if (valeurs.message.length < LIMITES.messageMin) {
      erreurs.message = 'Votre message doit contenir au moins ' + LIMITES.messageMin + ' caractères.';
    } else if (valeurs.message.length > LIMITES.messageMax) {
      erreurs.message = 'Votre message ne doit pas dépasser ' + LIMITES.messageMax + ' caractères.';
    }

    return {
      valide: Object.keys(erreurs).length === 0,
      erreurs: erreurs,
      valeurs: valeurs,
    };
  }

  return { LIMITES: LIMITES, validerMessage: validerMessage };
});
