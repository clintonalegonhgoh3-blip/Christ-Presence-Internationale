// Formulaire de contact : vérification des champs, envoi au serveur et
// affichage de la confirmation sans recharger la page.
// Responsable : FRONTEND 2
// Les règles de validation viennent de shared/validation-contact.js (chargé avant ce fichier).
(function () {
  'use strict';

  var formulaire = document.querySelector('[data-formulaire-contact]');
  if (!formulaire || !window.ValidationContact) return;

  var CHAMPS = ['nom', 'email', 'message'];
  var confirmation = document.getElementById('confirmation');
  var statut = document.getElementById('statut-formulaire');
  var boutonEnvoi = formulaire.querySelector('[type="submit"]');
  var texteBouton = boutonEnvoi.textContent;
  var compteur = formulaire.querySelector('[data-compteur]');
  var modeDemo = formulaire.getAttribute('data-mode') === 'demo';
  var champsTouches = {};

  function lireDonnees() {
    return {
      nom: formulaire.elements.nom.value,
      email: formulaire.elements.email.value,
      message: formulaire.elements.message.value,
      site_web: formulaire.elements.site_web.value,
    };
  }

  function afficherErreur(champ, message) {
    var zone = document.getElementById('erreur-' + champ);
    var entree = formulaire.elements[champ];
    zone.textContent = message || '';
    if (message) {
      entree.setAttribute('aria-invalid', 'true');
    } else {
      entree.removeAttribute('aria-invalid');
    }
  }

  function afficherErreurs(erreurs, placerFocus) {
    CHAMPS.forEach(function (champ) {
      afficherErreur(champ, erreurs[champ]);
    });
    if (placerFocus) {
      var premier = CHAMPS.filter(function (champ) { return erreurs[champ]; })[0];
      if (premier) formulaire.elements[premier].focus();
    }
  }

  function afficherStatut(message) {
    statut.textContent = message || '';
  }

  function mettreAJourCompteur() {
    if (compteur) compteur.textContent = formulaire.elements.message.value.length.toLocaleString('fr-FR');
  }

  function afficherConfirmation() {
    formulaire.hidden = true;
    confirmation.hidden = false;
    var noteDemo = confirmation.querySelector('.confirmation__demo');
    if (noteDemo) noteDemo.hidden = !modeDemo;
    confirmation.focus();
  }

  function attendre(ms) {
    return new Promise(function (resoudre) { setTimeout(resoudre, ms); });
  }

  // Vérifie un champ quand on le quitte, puis à chaque frappe une fois qu'il a été vérifié.
  CHAMPS.forEach(function (champ) {
    var entree = formulaire.elements[champ];
    entree.addEventListener('blur', function () {
      if (!entree.value.trim()) return;
      champsTouches[champ] = true;
      afficherErreur(champ, window.ValidationContact.validerMessage(lireDonnees()).erreurs[champ]);
    });
    entree.addEventListener('input', function () {
      if (champ === 'message') mettreAJourCompteur();
      if (champsTouches[champ]) {
        afficherErreur(champ, window.ValidationContact.validerMessage(lireDonnees()).erreurs[champ]);
      }
    });
  });
  mettreAJourCompteur();

  formulaire.addEventListener('submit', function (evenement) {
    evenement.preventDefault();
    afficherStatut('');

    var donnees = lireDonnees();
    var resultat = window.ValidationContact.validerMessage(donnees);
    CHAMPS.forEach(function (champ) { champsTouches[champ] = true; });
    afficherErreurs(resultat.erreurs, true);
    if (!resultat.valide) {
      afficherStatut('Certains champs sont à corriger.');
      return;
    }

    boutonEnvoi.disabled = true;
    boutonEnvoi.textContent = 'Envoi en cours…';

    var envoi;
    if (modeDemo) {
      // Aperçu sans serveur : on simule l'envoi, la confirmation le signale clairement.
      envoi = attendre(500).then(function () { return { ok: true, status: 200, json: {} }; });
    } else {
      envoi = fetch(formulaire.getAttribute('data-api'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(donnees),
      }).then(function (reponse) {
        return reponse.json().catch(function () { return {}; }).then(function (json) {
          return { ok: reponse.ok, status: reponse.status, json: json };
        });
      });
    }

    envoi
      .then(function (reponse) {
        if (reponse.ok) {
          afficherConfirmation();
        } else if (reponse.status === 400 && reponse.json.erreurs) {
          afficherErreurs(reponse.json.erreurs, true);
          afficherStatut('Certains champs sont à corriger.');
        } else if (reponse.status === 429) {
          afficherStatut(reponse.json.erreur || 'Trop de messages envoyés. Réessayez dans quelques minutes.');
        } else {
          afficherStatut("Le message n'a pas pu être envoyé. Réessayez plus tard ou contactez-nous par téléphone.");
        }
      })
      .catch(function () {
        afficherStatut("Le message n'a pas pu être envoyé : vérifiez votre connexion internet puis réessayez.");
      })
      .then(function () {
        boutonEnvoi.disabled = false;
        boutonEnvoi.textContent = texteBouton;
      });
  });

  // « Écrire un autre message » : réaffiche un formulaire vide.
  var lienNouveau = confirmation.querySelector('[data-nouveau-message]');
  if (lienNouveau) {
    lienNouveau.addEventListener('click', function (evenement) {
      evenement.preventDefault();
      formulaire.reset();
      champsTouches = {};
      afficherErreurs({}, false);
      mettreAJourCompteur();
      confirmation.hidden = true;
      formulaire.hidden = false;
      formulaire.elements.nom.focus();
    });
  }
})();
