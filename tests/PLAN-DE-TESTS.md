# Plan de tests manuels

Responsable : **Tests**. À dérouler en semaine 3 puis une dernière fois avant la livraison du 30 novembre.
Chaque problème trouvé devient une *issue* GitHub avec : la page, l'appareil, ce qui était attendu, ce qui s'est passé, une capture d'écran.

## 1. Appareils et navigateurs

| Appareil | Navigateur | Testé par | Date | Résultat |
| --- | --- | --- | --- | --- |
| Téléphone Android | Chrome | | | |
| iPhone | Safari | | | |
| Tablette | Navigateur par défaut | | | |
| Ordinateur | Chrome ou Edge | | | |
| Ordinateur | Firefox | | | |

## 2. Navigation (sur chaque appareil)

- [ ] Le menu mène à chaque page ; la page en cours est mise en évidence.
- [ ] Sur téléphone, le bouton « Menu » ouvre et ferme le menu ; la touche Échap le ferme sur ordinateur.
- [ ] Les boutons « Nous rendre visite » mènent à la partie Adresse de la page Contact.
- [ ] Les boutons « Nous contacter » mènent au formulaire.
- [ ] « Découvrir les prochaines activités » (accueil) mène à la page Horaires et activités.
- [ ] Le pied de page affiche les coordonnées et les liens utiles sur toutes les pages.
- [ ] Une adresse inconnue (`/test`) affiche la page « Page introuvable ».
- [ ] Aucune page ne défile horizontalement sur téléphone.

## 3. Formulaire de contact

- [ ] Envoi vide : un message d'erreur sous chaque champ, le curseur va sur le premier champ en erreur.
- [ ] Courriel invalide (`marie@`) : erreur sur le courriel seulement.
- [ ] Message de moins de 10 caractères : erreur sur le message.
- [ ] Le compteur de caractères avance pendant la saisie.
- [ ] Envoi correct : la confirmation s'affiche, le message apparaît dans `data/messages.json`.
- [ ] « Écrire un autre message » réaffiche un formulaire vide.
- [ ] Six envois de suite : le sixième est refusé avec un message clair.
- [ ] JavaScript désactivé : l'envoi fonctionne et affiche la confirmation.

## 4. Lisibilité et accessibilité

- [ ] Tout le site se parcourt au clavier (Tab, Maj+Tab, Entrée) et le focus est toujours visible.
- [ ] Le lien « Aller au contenu » apparaît au premier appui sur Tab.
- [ ] Zoom du navigateur à 200 % : rien n'est coupé ni superposé.
- [ ] Thème sombre de l'appareil activé : tous les textes restent lisibles.
- [ ] Audit Lighthouse (Chrome › F12 › onglet Lighthouse) sur Accueil et Contact : noter les scores Performance, Accessibilité, Bonnes pratiques, SEO.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | --- | --- | --- | --- |
| Accueil | | | | |
| Contact | | | | |

## 5. Contenu

- [ ] `npm run contenu` : noter le nombre d'éléments encore à compléter.
- [ ] Relire chaque page à voix haute : fautes, phrases trop longues, informations contradictoires.
- [ ] Vérifier les horaires et l'adresse avec un responsable de l'église.
