// Prépare les données envoyées aux vues EJS.
// Utilisé à la fois par le serveur Express et par l'export statique
// (scripts/build-static.js), pour que les deux produisent exactement les mêmes pages.
const { PAGES, trouverPage } = require('./pages');
const contenu = require('./services/contenu');

// Échappe le HTML (protection contre l'injection de code dans les pages).
function echapper(valeur) {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Affiche une valeur de contenu. Si elle est encore temporaire, elle est
// surlignée pour que l'équipe la repère tout de suite sur le site.
function champ(valeur) {
  const texte = echapper(valeur);
  if (contenu.estACompleter(valeur)) {
    return `<span class="a-completer" title="Information à compléter dans le dossier content/">${texte}</span>`;
  }
  return texte;
}

function creerOutils({ statique }) {
  return {
    champ,
    estRempli: contenu.estRempli,
    estACompleter: contenu.estACompleter,
    // Lien vers une page du site : « /a-propos » sur le serveur, « a-propos.html » en export statique.
    lien(id) {
      const page = trouverPage(id);
      return statique ? page.fichier : page.chemin;
    },
    // Chemin d'un fichier du dossier public/ (CSS, JS, images).
    ressource(chemin) {
      return statique ? chemin : `/${chemin}`;
    },
    // Lien téléphone utilisable : retire les espaces et points.
    lienTelephone(numero) {
      return `tel:${String(numero).replace(/[^\d+]/g, '')}`;
    },
    // Initiales affichées quand un membre de l'équipe n'a pas de photo.
    initiales(nom) {
      if (!contenu.estRempli(nom)) return '?';
      return nom
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((mot) => mot[0].toUpperCase())
        .join('');
    },
    // « 2026-11-08 » → « dimanche 8 novembre 2026 » (null si la date est vide ou invalide).
    dateLisible(texte) {
      const date = contenu.formaterDate(contenu.lireDate(texte));
      return date ? date.complet : null;
    },
    // Fichier audio/vidéo : adresse complète (https://…) ou fichier du dossier public/.
    urlMedia(chemin) {
      if (/^https:\/\//.test(chemin)) return chemin;
      return statique ? chemin : `/${chemin}`;
    },
  };
}

function donneesPage(idPage, { statique = false, maintenant = new Date(), extra = {} } = {}) {
  const page = trouverPage(idPage);
  const site = contenu.chargerContenu('site');
  const donnees = page.contenu ? contenu.chargerContenu(page.contenu) : {};
  const activites = contenu.chargerContenu('activites');

  const evenements = contenu
    .evenementsAVenir(activites.evenements, maintenant)
    .map((evenement) => ({ ...evenement, dateFormatee: contenu.formaterDate(evenement.dateObjet) }));

  return {
    ...creerOutils({ statique }),
    statique,
    site,
    contenu: donnees,
    activites,
    evenements,
    page,
    pageActive: page.id,
    menu: PAGES.filter((p) => p.titreMenu),
    titrePage: page.titre ? `${page.titre} · ${site.nom}` : site.nom,
    descriptionPage: contenu.estRempli(site.descriptionCourte) ? site.descriptionCourte : site.nom,
    annee: maintenant.getFullYear(),
    formulaire: { envoye: false, erreurs: {}, valeurs: {} },
    ...extra,
  };
}

module.exports = { donneesPage, echapper, champ };
