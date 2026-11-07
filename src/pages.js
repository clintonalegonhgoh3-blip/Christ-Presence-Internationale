// Liste unique des pages du site.
// Utilisée par les routes Express, le menu, le pied de page et l'export statique.
// Pour ajouter une page : ajoutez une entrée ici, une vue dans views/ et un
// fichier de contenu dans content/.
const PAGES = [
  {
    id: 'accueil',
    chemin: '/',
    fichier: 'index.html',
    vue: 'accueil',
    contenu: 'accueil',
    titreMenu: 'Accueil',
    titre: null, // la page d'accueil prend simplement le nom de l'église
  },
  {
    id: 'a-propos',
    chemin: '/a-propos',
    fichier: 'a-propos.html',
    vue: 'a-propos',
    contenu: 'a-propos',
    titreMenu: 'À propos',
    titre: 'À propos',
  },
  {
    id: 'horaires-activites',
    chemin: '/horaires-activites',
    fichier: 'horaires-activites.html',
    vue: 'horaires-activites',
    contenu: 'activites',
    titreMenu: 'Horaires et activités',
    titre: 'Horaires et activités',
  },
  {
    id: 'enseignements',
    chemin: '/enseignements',
    fichier: 'enseignements.html',
    vue: 'enseignements',
    contenu: 'enseignements',
    titreMenu: 'Enseignements',
    titre: 'Enseignements',
  },
  {
    id: 'contact',
    chemin: '/contact',
    fichier: 'contact.html',
    vue: 'contact',
    contenu: 'contact',
    titreMenu: 'Contact et accès',
    titre: 'Contact et accès',
  },
  {
    id: 'mentions-legales',
    chemin: '/mentions-legales',
    fichier: 'mentions-legales.html',
    vue: 'mentions-legales',
    contenu: 'mentions-legales',
    titreMenu: null, // pas dans le menu principal, seulement dans le pied de page
    titre: 'Mentions légales et confidentialité',
  },
];

function trouverPage(id) {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Page inconnue : ${id}`);
  return page;
}

module.exports = { PAGES, trouverPage };
