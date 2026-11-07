# Site web — Christ Présence Internationale

Prototype du site de l'église, à livrer le **30 novembre 2026**.
Site en français, adapté aux téléphones, tablettes et ordinateurs, avec un thème clair et un thème sombre automatique.

**Pages :** Accueil · À propos · Horaires et activités · Enseignements · Contact et accès · Mentions légales.

---

## 1. Installer le projet (à faire une fois)

1. Installer **Node.js** (version LTS 22 ou plus récente) : <https://nodejs.org>
   Vérifier dans un terminal : `node --version`
2. Récupérer le projet :
   ```bash
   git clone <adresse-du-depot-github>
   cd site-christ-presence-internationale
   npm install
   ```
3. Lancer le site :
   ```bash
   npm run dev
   ```
   Ouvrir <http://localhost:3000> dans le navigateur. Le serveur redémarre tout seul quand un fichier change.

## 2. Commandes utiles

| Commande | Ce qu'elle fait |
| --- | --- |
| `npm run dev` | Lance le site en mode développement (redémarrage automatique) |
| `npm start` | Lance le site en mode normal |
| `npm test` | Lance tous les tests automatiques (à faire avant chaque *pull request*) |
| `npm run contenu` | Liste tous les textes encore marqués `[À COMPLÉTER : …]` |
| `npm run build` | Génère une version statique du site dans `dist/` (aperçu sans serveur, formulaire en mode démonstration) |

## 3. Qui travaille où

Chaque membre a « ses » fichiers : cela évite que deux personnes modifient le même fichier en même temps (conflits Git).

| Dossier / fichier | Rôle | Contenu |
| --- | --- | --- |
| `content/*.json` | **Contenu-ALE GONH-GOH** | Tous les textes, horaires, coordonnées, équipe, prédications |
| `views/partials/debut.ejs`, `fin.ejs`, `en-tete-page.ejs` | **Frontend 1-DJONGON** | En-tête, menu, pied de page communs |
| `views/accueil.ejs`, `a-propos.ejs`, `404.ejs` | **Frontend 1-DJONGON** | Pages Accueil, À propos, page introuvable |
| `public/css/base.css`, `mise-en-page.css` | **Frontend 1-DJONGON** | Couleurs, polices, structure générale |
| `public/js/menu.js` | **Frontend 1-DJONGON** | Menu sur téléphone |
| `views/horaires-activites.ejs`, `enseignements.ejs`, `contact.ejs`, `mentions-legales.ejs`, `partials/liste-evenements.ejs` | **Frontend 2-ALOUA** | Pages Horaires, Enseignements, Contact, Mentions légales |
| `public/js/formulaire-contact.js` | **Frontend 2-ALOUA** | Vérification et envoi du formulaire |
| `public/css/composants.css`, `pages.css` | **Frontend 1-DJONGON et 2-ALOUA** | Chacun dans sa partie (indiquée par des titres dans le fichier) |
| `src/`, `shared/` | **Backend-AL PIDIO** | Serveur, routes, réception des messages, sécurité |
| `tests/` | **Tests-KOUDADJE** | Tests automatiques et plan de tests manuels |
| `scripts/`, `.github/`, `package.json`, `README.md` | **Chef de projet-ALE GONH-GOH** | Outils, intégration continue, documentation |

## 4. Modifier le contenu (sans toucher au code)

Tous les textes sont dans le dossier `content/` :

| Fichier | Page |
| --- | --- |
| `site.json` | Nom, adresse, téléphone, courriel, carte, réseaux sociaux (en-tête, pied de page, contact) |
| `accueil.json` | Page d'accueil |
| `a-propos.json` | Histoire, vision, valeurs, équipe |
| `activites.json` | Cultes, groupes, événements |
| `enseignements.json` | Prédications (audio, vidéo) |
| `contact.json` | Textes de la page Contact |
| `mentions-legales.json` | Informations légales |

Règles :

- Remplacer chaque `[À COMPLÉTER : …]` par l'information réelle, **en gardant les guillemets** `"…"`.
- Tant qu'un texte n'est pas remplacé, il apparaît **surligné en jaune** sur le site.
- Les clés qui commencent par `_` (`_aide`, `_statut`) sont des notes pour l'équipe : elles ne s'affichent pas.
- Dates d'événements au format `AAAA-MM-JJ` (exemple : `2026-12-24`). Les événements passés disparaissent automatiquement.
- Après chaque modification : `npm test` vérifie que le fichier JSON est toujours valide.
- Photos de l'équipe : `public/img/equipe/` (demander l'accord écrit de chaque personne).
- Fichiers audio des prédications : `public/audio/` (format .mp3, compressé à 64–96 kbit/s pour rester léger).

## 5. Travailler à plusieurs avec Git

1. Toujours partir d'une version à jour : `git checkout main` puis `git pull`.
2. Créer une branche par tâche : `git checkout -b front2/formulaire-compteur`.
3. Faire des *commits* courts, en français : `git commit -m "Contact : ajoute le compteur de caractères"`.
4. Avant d'envoyer : `npm test` doit afficher **tous les tests réussis**.
5. Envoyer la branche (`git push -u origin <nom-de-branche>`) et ouvrir une *pull request* sur GitHub.
6. Le chef de projet relit et fusionne. Personne ne pousse directement sur `main`.

Les tests se lancent aussi automatiquement sur GitHub à chaque *pull request* (`.github/workflows/tests.yml`).

## 6. Fonctionnement du formulaire de contact

- Le visiteur remplit nom, courriel et message. Les champs sont vérifiés dans le navigateur **et** sur le serveur, avec les mêmes règles (`shared/validation-contact.js`).
- Le message est envoyé à `POST /api/contact`, puis une confirmation s'affiche sans recharger la page.
- Sans JavaScript, le formulaire fonctionne quand même (envoi classique vers `POST /contact`).
- Protections : limite de 5 messages par 15 minutes et par visiteur, champ piège anti-robots, en-têtes de sécurité (Helmet), échappement du HTML.
- Prototype : les messages sont enregistrés dans `data/messages.json` (exclu de Git, car il contient des données personnelles). L'envoi d'un courriel à l'église est prévu dans `src/services/notification.js`.

## 7. Données personnelles et mentions légales

Un site publié en France doit afficher des mentions légales (éditeur, responsable de la publication, hébergeur) et expliquer l'usage des données du formulaire (RGPD). La page `/mentions-legales` est prête : il reste à la remplir dans `content/mentions-legales.json`.

Avant la mise en ligne publique : héberger les polices sur le serveur du site (au lieu de Google Fonts) pour éviter de transmettre l'adresse IP des visiteurs à un tiers.
