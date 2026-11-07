// Tests du contenu (dossier content/) et des fonctions qui le lisent.
// Responsable : TESTS (avec l'équipe CONTENU)
// Ces tests échouent si un fichier JSON est mal écrit ou si une rubrique
// obligatoire a été supprimée par erreur.
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const {
  chargerContenu,
  estACompleter,
  estRempli,
  evenementsAVenir,
  champsACompleter,
  formaterDate,
  lireDate,
} = require('../src/services/contenu');

describe('fichiers de contenu', () => {
  const fichiers = fs.readdirSync(config.dossierContenu).filter((f) => f.endsWith('.json'));

  test.each(fichiers)('%s est un JSON valide', (fichier) => {
    expect(() => chargerContenu(path.basename(fichier, '.json'))).not.toThrow();
  });

  test('site.json contient les coordonnées attendues', () => {
    const site = chargerContenu('site');
    expect(site.nom).toBeTruthy();
    expect(site.adresse).toEqual(
      expect.objectContaining({ rue: expect.any(String), codePostal: expect.any(String), ville: expect.any(String) })
    );
    expect(typeof site.telephone).toBe('string');
    expect(typeof site.courriel).toBe('string');
    expect(Array.isArray(site.reseaux)).toBe(true);
  });

  test('activites.json contient cultes, groupes et événements', () => {
    const activites = chargerContenu('activites');
    expect(Array.isArray(activites.cultes)).toBe(true);
    expect(Array.isArray(activites.groupes)).toBe(true);
    expect(Array.isArray(activites.evenements)).toBe(true);
  });

  test('les dates d’événements sont vides ou au format AAAA-MM-JJ', () => {
    const { evenements } = chargerContenu('activites');
    for (const evenement of evenements) {
      if (evenement.date !== '') expect(lireDate(evenement.date)).not.toBeNull();
    }
  });

  test('enseignements.json contient une liste de prédications', () => {
    expect(Array.isArray(chargerContenu('enseignements').predications)).toBe(true);
  });
});

describe('repérage des textes à compléter', () => {
  test('estACompleter reconnaît le marqueur', () => {
    expect(estACompleter('[À COMPLÉTER : ville]')).toBe(true);
    expect(estACompleter('Chalon')).toBe(false);
  });

  test('estRempli refuse les valeurs vides ou temporaires', () => {
    expect(estRempli('')).toBe(false);
    expect(estRempli('   ')).toBe(false);
    expect(estRempli('[À COMPLÉTER : ville]')).toBe(false);
    expect(estRempli('03 00 00 00 00')).toBe(true);
  });

  test('champsACompleter donne le chemin de chaque champ et ignore les notes _aide', () => {
    const resultat = champsACompleter({
      _aide: '[À COMPLÉTER : ignoré]',
      nom: 'CPI',
      adresse: { ville: '[À COMPLÉTER : ville]' },
      liste: [{ titre: '[À COMPLÉTER : titre]' }],
    });
    expect(resultat.map((r) => r.chemin)).toEqual(['adresse.ville', 'liste[0].titre']);
  });
});

describe('événements à venir', () => {
  const maintenant = new Date('2026-11-15T10:00:00Z');

  test('masque les événements passés et trie par date', () => {
    const resultat = evenementsAVenir(
      [
        { titre: 'Passé', date: '2026-11-01' },
        { titre: 'Décembre', date: '2026-12-24' },
        { titre: 'Aujourd’hui', date: '2026-11-15' },
        { titre: 'Sans date', date: '' },
      ],
      maintenant
    );
    expect(resultat.map((e) => e.titre)).toEqual(['Aujourd’hui', 'Décembre', 'Sans date']);
  });

  test('formaterDate écrit la date en français', () => {
    const date = formaterDate(lireDate('2026-12-24'));
    expect(date.jour).toBe('24');
    expect(date.complet).toMatch(/jeudi 24 décembre 2026/);
  });
});
