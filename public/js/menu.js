// Menu sur téléphone et tablette : ouvre et ferme le panneau de navigation.
// Responsable : FRONTEND 1
// Ce script est chargé dans <head> pour indiquer tout de suite que JavaScript
// est actif (classe « js ») et éviter que le menu clignote au chargement.
(function () {
  'use strict';

  var racine = document.documentElement;
  racine.classList.remove('sans-js');
  racine.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var bouton = document.querySelector('.menu-bouton');
    var menu = document.getElementById('menu-principal');
    if (!bouton || !menu) return;

    function ouvrir() {
      menu.classList.add('est-ouvert');
      bouton.setAttribute('aria-expanded', 'true');
    }

    function fermer() {
      menu.classList.remove('est-ouvert');
      bouton.setAttribute('aria-expanded', 'false');
    }

    bouton.addEventListener('click', function () {
      if (bouton.getAttribute('aria-expanded') === 'true') {
        fermer();
      } else {
        ouvrir();
      }
    });

    // Touche Échap : ferme le menu et remet le focus sur le bouton.
    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape' && menu.classList.contains('est-ouvert')) {
        fermer();
        bouton.focus();
      }
    });

    // Un clic sur un lien ferme le menu (utile pour les liens vers une section de la même page).
    menu.addEventListener('click', function (evenement) {
      if (evenement.target.closest('a')) fermer();
    });

    // Si la fenêtre s'élargit jusqu'au format ordinateur, on remet le menu à zéro.
    var grandEcran = window.matchMedia('(min-width: 72.01rem)');
    var surChangement = function (e) {
      if (e.matches) fermer();
    };
    if (grandEcran.addEventListener) {
      grandEcran.addEventListener('change', surChangement);
    }
  });
})();
