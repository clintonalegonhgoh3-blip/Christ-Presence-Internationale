// Enregistrement des messages reçus par le formulaire de contact.
// Responsable : BACKEND.
//
// Prototype : les messages sont stockés dans un fichier JSON (data/messages.json,
// exclu de Git car il contient des données personnelles).
// Évolution prévue : remplacer ce module par une base de données (voir le modèle
// du cahier des charges) en gardant les mêmes fonctions enregistrerMessage() et
// lireMessages(), pour ne rien changer ailleurs dans le code.
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// File d'attente : deux messages envoyés en même temps ne s'écrasent pas.
let fileAttente = Promise.resolve();

async function lireMessages(fichier) {
  try {
    const brut = await fs.readFile(fichier, 'utf8');
    return JSON.parse(brut);
  } catch (erreur) {
    if (erreur.code === 'ENOENT') return [];
    throw erreur;
  }
}

function enregistrerMessage({ nom, email, message }, fichier) {
  const tache = fileAttente.then(async () => {
    await fs.mkdir(path.dirname(fichier), { recursive: true });
    const messages = await lireMessages(fichier);
    const entree = {
      id: crypto.randomUUID(),
      recuLe: new Date().toISOString(),
      nom,
      email,
      message,
      traite: false,
    };
    messages.push(entree);
    await fs.writeFile(fichier, JSON.stringify(messages, null, 2), 'utf8');
    return entree;
  });
  // La file continue même si une écriture échoue.
  fileAttente = tache.catch(() => {});
  return tache;
}

module.exports = { lireMessages, enregistrerMessage };
