// Lecture des fichiers de contenu (dossier content/).
// Responsable : BACKEND. Le contenu lui-même est géré par l'équipe CONTENU.
//
// Les fichiers sont relus à chaque requête : une modification dans content/
// est visible immédiatement, sans redémarrer le serveur.
const fs = require('fs');
const path = require('path');
const config = require('../config');

const MARQUEUR = '[À COMPLÉTER';

function chargerContenu(nom, dossier = config.dossierContenu) {
  const fichier = path.join(dossier, `${nom}.json`);
  const brut = fs.readFileSync(fichier, 'utf8');
  try {
    return JSON.parse(brut);
  } catch (erreur) {
    throw new Error(`Le fichier content/${nom}.json contient une erreur de syntaxe JSON : ${erreur.message}`);
  }
}

// Vrai si la valeur contient encore un texte temporaire à remplacer.
function estACompleter(valeur) {
  return typeof valeur === 'string' && valeur.includes(MARQUEUR);
}

// Vrai si la valeur est une information réelle (ni vide, ni temporaire).
function estRempli(valeur) {
  return typeof valeur === 'string' && valeur.trim() !== '' && !estACompleter(valeur);
}

// Interprète une date au format AAAA-MM-JJ. Renvoie null si la date est absente ou invalide.
function lireDate(texte) {
  if (typeof texte !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return null;
  const date = new Date(`${texte}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Garde les événements à venir (ou sans date valide), triés du plus proche au plus lointain.
// Les événements passés disparaissent automatiquement du site.
function evenementsAVenir(evenements = [], maintenant = new Date()) {
  const debutDuJour = new Date(maintenant);
  debutDuJour.setUTCHours(0, 0, 0, 0);

  return evenements
    .map((evenement) => ({ ...evenement, dateObjet: lireDate(evenement.date) }))
    .filter((evenement) => !evenement.dateObjet || evenement.dateObjet >= debutDuJour)
    .sort((a, b) => {
      if (a.dateObjet && b.dateObjet) return a.dateObjet - b.dateObjet;
      if (a.dateObjet) return -1;
      if (b.dateObjet) return 1;
      return 0;
    });
}

const formatJour = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'Europe/Paris' });
const formatMois = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'Europe/Paris' });
const formatComplet = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

function formaterDate(date) {
  if (!date) return null;
  return {
    jour: formatJour.format(date),
    mois: formatMois.format(date).replace('.', ''),
    complet: formatComplet.format(date),
    iso: date.toISOString().slice(0, 10),
  };
}

// Liste tous les champs encore marqués [À COMPLÉTER] dans un objet de contenu.
function champsACompleter(objet, chemin = '') {
  const resultats = [];
  if (estACompleter(objet)) {
    resultats.push({ chemin, valeur: objet });
  } else if (Array.isArray(objet)) {
    objet.forEach((element, index) => resultats.push(...champsACompleter(element, `${chemin}[${index}]`)));
  } else if (objet && typeof objet === 'object') {
    for (const [cle, valeur] of Object.entries(objet)) {
      if (cle.startsWith('_')) continue; // les clés _aide et _statut sont des notes pour l'équipe
      resultats.push(...champsACompleter(valeur, chemin ? `${chemin}.${cle}` : cle));
    }
  }
  return resultats;
}

module.exports = {
  MARQUEUR,
  chargerContenu,
  estACompleter,
  estRempli,
  lireDate,
  evenementsAVenir,
  formaterDate,
  champsACompleter,
};
