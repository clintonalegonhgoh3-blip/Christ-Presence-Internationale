// Tests des pages du site (routes, menu, pied de page, sécurité).
// Responsable : TESTS
const request = require('supertest');
const { creerApp } = require('../src/app');
const { PAGES } = require('../src/pages');

const app = creerApp();

describe('pages du site', () => {
  test.each(PAGES.map((p) => [p.chemin, p]))('GET %s répond 200 en HTML', async (chemin, page) => {
    const reponse = await request(app).get(chemin);
    expect(reponse.status).toBe(200);
    expect(reponse.headers['content-type']).toMatch(/text\/html/);
    expect(reponse.text).toMatch(/<html lang="fr"/);
    expect(reponse.text).toMatch(/<title>[^<]+<\/title>/);
    if (page.titre) expect(reponse.text).toContain(page.titre);
  });

  test.each(PAGES.filter((p) => p.titreMenu).map((p) => [p.chemin, p.id]))(
    'le lien de %s est marqué comme page active dans le menu',
    async (chemin) => {
      const reponse = await request(app).get(chemin);
      expect(reponse.text).toMatch(new RegExp(`href="${chemin}" aria-current="page"`));
    }
  );

  test('chaque page a un menu, un pied de page et les boutons Nous rendre visite / Nous contacter', async () => {
    for (const page of PAGES) {
      const { text } = await request(app).get(page.chemin);
      expect(text).toContain('id="menu-principal"');
      expect(text).toContain('class="pied"');
      expect(text).toContain('Nous rendre visite');
      expect(text).toContain('Nous contacter');
    }
  });

  test('l’accueil propose de découvrir les prochaines activités', async () => {
    const { text } = await request(app).get('/');
    expect(text).toContain('Découvrir les prochaines activités');
    expect(text).toContain('href="/horaires-activites"');
  });

  test('la page contact contient le formulaire avec nom, courriel et message', async () => {
    const { text } = await request(app).get('/contact');
    expect(text).toContain('data-formulaire-contact');
    expect(text).toMatch(/<label for="nom">/);
    expect(text).toMatch(/<label for="email">/);
    expect(text).toMatch(/<label for="message">/);
  });

  test('les textes à compléter sont surlignés', async () => {
    const { text } = await request(app).get('/contact');
    expect(text).toContain('class="a-completer"');
  });

  test('une adresse inconnue renvoie la page 404', async () => {
    const reponse = await request(app).get('/cette-page-n-existe-pas');
    expect(reponse.status).toBe(404);
    expect(reponse.text).toContain('Page introuvable');
  });
});

describe('sécurité', () => {
  test('les en-têtes de sécurité sont présents', async () => {
    const reponse = await request(app).get('/');
    expect(reponse.headers['content-security-policy']).toBeDefined();
    expect(reponse.headers['x-content-type-options']).toBe('nosniff');
    expect(reponse.headers['x-powered-by']).toBeUndefined();
  });

  test('les fichiers CSS et JavaScript sont servis', async () => {
    await request(app).get('/css/base.css').expect(200);
    await request(app).get('/js/formulaire-contact.js').expect(200);
    await request(app).get('/js/shared/validation-contact.js').expect(200);
  });
});
