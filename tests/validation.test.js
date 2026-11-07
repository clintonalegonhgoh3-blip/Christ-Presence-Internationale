// Tests des règles de validation du formulaire (shared/validation-contact.js).
// Responsable : TESTS
const { validerMessage, LIMITES } = require('../shared/validation-contact');

const messageValide = {
  nom: 'Marie Durand',
  email: 'marie.durand@exemple.fr',
  message: 'Bonjour, je souhaite venir au prochain culte.',
};

describe('validerMessage', () => {
  test('accepte un message complet et correct', () => {
    const resultat = validerMessage(messageValide);
    expect(resultat.valide).toBe(true);
    expect(resultat.erreurs).toEqual({});
  });

  test('retire les espaces au début et à la fin', () => {
    const resultat = validerMessage({ ...messageValide, nom: '   Marie   ' });
    expect(resultat.valeurs.nom).toBe('Marie');
  });

  test('refuse un formulaire vide avec une erreur par champ', () => {
    const resultat = validerMessage({});
    expect(resultat.valide).toBe(false);
    expect(Object.keys(resultat.erreurs).sort()).toEqual(['email', 'message', 'nom']);
  });

  test('refuse un nom trop court ou trop long', () => {
    expect(validerMessage({ ...messageValide, nom: 'A' }).erreurs.nom).toBeDefined();
    expect(validerMessage({ ...messageValide, nom: 'A'.repeat(LIMITES.nomMax + 1) }).erreurs.nom).toBeDefined();
  });

  test.each(['marie', 'marie@', 'marie@exemple', '@exemple.fr', 'marie durand@exemple.fr'])(
    'refuse l’adresse courriel invalide « %s »',
    (email) => {
      expect(validerMessage({ ...messageValide, email }).erreurs.email).toBeDefined();
    }
  );

  test('refuse un message trop court ou trop long', () => {
    expect(validerMessage({ ...messageValide, message: 'Bonjour' }).erreurs.message).toBeDefined();
    expect(
      validerMessage({ ...messageValide, message: 'a'.repeat(LIMITES.messageMax + 1) }).erreurs.message
    ).toBeDefined();
  });

  test('les messages d’erreur sont en français', () => {
    const { erreurs } = validerMessage({});
    expect(erreurs.nom).toMatch(/nom/i);
    expect(erreurs.email).toMatch(/courriel/i);
  });
});
