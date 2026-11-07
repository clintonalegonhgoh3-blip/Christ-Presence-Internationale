// Liste tous les textes encore à compléter dans le dossier content/.
//   npm run contenu
// Responsable : CONTENU. À lancer avant chaque réunion d'équipe pour suivre l'avancement.
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const { chargerContenu, champsACompleter } = require('../src/services/contenu');

const fichiers = fs
  .readdirSync(config.dossierContenu)
  .filter((nom) => nom.endsWith('.json'))
  .sort();

let total = 0;
const aValider = [];

for (const fichier of fichiers) {
  const nom = path.basename(fichier, '.json');
  let donnees;
  try {
    donnees = chargerContenu(nom);
  } catch (erreur) {
    console.error(`\n✗ ${fichier} : ${erreur.message}`);
    process.exitCode = 1;
    continue;
  }

  const manquants = champsACompleter(donnees);
  total += manquants.length;
  if (donnees._statut) aValider.push(fichier);

  if (manquants.length === 0) {
    console.log(`\n✓ ${fichier} : complet`);
    continue;
  }
  console.log(`\n• ${fichier} : ${manquants.length} élément(s) à compléter`);
  for (const { chemin, valeur } of manquants) {
    const consigne = valeur.replace(/^\[À COMPLÉTER\s*:\s*/, '').replace(/\]$/, '');
    console.log(`    - ${chemin} → ${consigne}`);
  }
}

console.log(`\nTotal : ${total} élément(s) à compléter.`);
if (aValider.length) {
  console.log(`Textes provisoires à faire valider par l'église : ${aValider.join(', ')}`);
}
