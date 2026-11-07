// Notification de l'équipe de l'église quand un message arrive.
// Responsable : BACKEND.
//
// PROTOTYPE : la notification est seulement écrite dans la console du serveur.
// À FAIRE (semaine 3) : envoyer un courriel à l'adresse de l'église avec le
// paquet « nodemailer » et un compte SMTP fourni par l'église. Les identifiants
// SMTP vont dans le fichier .env, jamais dans le code ni dans Git.
async function notifierNouveauMessage(entree) {
  console.log(`[contact] Nouveau message de ${entree.nom} (${entree.recuLe})`);
}

module.exports = { notifierNouveauMessage };
