// Export statique : génère le site en fichiers HTML dans le dossier dist/.
//   npm run build
// Utile pour montrer un aperçu du site sans serveur (ouvrir dist/index.html).
// Dans cette version, le formulaire de contact fonctionne en « mode démonstration » :
// il affiche la confirmation mais n'envoie rien.
// Responsable : INTÉGRATION (chef de projet)
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const config = require('../src/config');
const { PAGES } = require('../src/pages');
const { donneesPage } = require('../src/rendu');

const dossierSortie = path.join(config.racine, 'dist');

async function construire() {
  fs.rmSync(dossierSortie, { recursive: true, force: true });
  fs.mkdirSync(dossierSortie, { recursive: true });

  for (const page of PAGES) {
    const html = await ejs.renderFile(
      path.join(config.dossierVues, `${page.vue}.ejs`),
      donneesPage(page.id, { statique: true }),
      { views: [config.dossierVues] }
    );
    fs.writeFileSync(path.join(dossierSortie, page.fichier), html);
    console.log(`  ✓ ${page.fichier}`);
  }

  const html404 = await ejs.renderFile(
    path.join(config.dossierVues, '404.ejs'),
    donneesPage('accueil', { statique: true, extra: { titrePage: 'Page introuvable', pageActive: null } }),
    { views: [config.dossierVues] }
  );
  fs.writeFileSync(path.join(dossierSortie, '404.html'), html404);
  console.log('  ✓ 404.html');

  fs.cpSync(config.dossierPublic, dossierSortie, { recursive: true });
  fs.cpSync(config.dossierPartage, path.join(dossierSortie, 'js', 'shared'), { recursive: true });
  console.log(`Site exporté dans ${path.relative(process.cwd(), dossierSortie) || 'dist'}/`);
}

construire().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
