// Badge « culte en direct » : décompte avant le culte, état « En direct » pendant.
// Responsable : FRONTEND 1
// Sans JavaScript, le lien reste un simple lien « Culte en direct ».
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var lien = document.querySelector('.direct');
    if (!lien) return;

    var texte = lien.querySelector('.direct__texte');
    var compte = lien.querySelector('.direct__compte');

    var JOURS = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
    var NOMS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    var jourCible = JOURS[(lien.dataset.jour || '').toLowerCase()];
    var morceaux = (lien.dataset.heure || '').split(':');
    var heure = parseInt(morceaux[0], 10);
    var minute = parseInt(morceaux[1], 10);
    var dureeSecondes = (parseInt(lien.dataset.duree, 10) || 150) * 60;
    var fuseau = lien.dataset.fuseau || 'Europe/Paris';

    // Configuration incomplète : on garde le simple lien.
    if (jourCible === undefined || isNaN(heure) || isNaN(minute)) return;

    var format;
    try {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone: fuseau, weekday: 'short', hour: 'numeric',
        minute: 'numeric', second: 'numeric', hourCycle: 'h23'
      });
    } catch (erreur) {
      return;
    }

    var SEMAINE = 7 * 86400;

    // Secondes écoulées depuis dimanche 00:00, à l'heure du fuseau de l'église.
    function maintenantEnSecondes() {
      var p = {};
      format.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return NOMS[p.weekday] * 86400 + parseInt(p.hour, 10) * 3600 +
             parseInt(p.minute, 10) * 60 + parseInt(p.second, 10);
    }

    function deuxChiffres(n) { return (n < 10 ? '0' : '') + n; }

    function mettreAJour() {
      var debut = jourCible * 86400 + heure * 3600 + minute * 60;
      var maintenant = maintenantEnSecondes();
      var depuis = (maintenant - debut + SEMAINE) % SEMAINE;

      if (depuis < dureeSecondes) {
        lien.classList.add('direct--live');
        texte.textContent = 'En direct';
        compte.textContent = '';
        return;
      }

      lien.classList.remove('direct--live');
      var reste = SEMAINE - depuis;
      var jours = Math.floor(reste / 86400);
      var h = Math.floor((reste % 86400) / 3600);
      var m = Math.floor((reste % 3600) / 60);
      var s = reste % 60;
      texte.textContent = 'Direct dans';
      compte.textContent = (jours > 0 ? jours + ' j ' : '') +
        deuxChiffres(h) + ':' + deuxChiffres(m) + ':' + deuxChiffres(s);
    }

    mettreAJour();
    setInterval(mettreAJour, 1000);
  });
})();