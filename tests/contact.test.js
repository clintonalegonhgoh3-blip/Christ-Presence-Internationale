// Tests de la réception des messages (API /api/contact et formulaire /contact).
// Responsable : TESTS (avec le BACKEND)
const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { creerApp } = require('../src/app');
const { lireMessages } = require('../src/services/messages');

const messageValide = {
  nom: 'Marie Durand',
  email: 'marie.durand@exemple.fr',
  message: 'Bonjour, à quelle heure commence le culte ?',
};

let dossierTemporaire;
let fichierMessages;
let app;

beforeEach(() => {
  // Chaque test écrit dans son propre fichier, jamais dans data/messages.json.
  dossierTemporaire = fs.mkdtempSync(path.join(os.tmpdir(), 'cpi-tests-'));
  fichierMessages = path.join(dossierTemporaire, 'messages.json');
  app = creerApp({ fichierMessages, limiteMessages: 100 });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(dossierTemporaire, { recursive: true, force: true });
  jest.restoreAllMocks();
});

describe('POST /api/contact', () => {
  test('enregistre un message valide et répond 201', async () => {
    const reponse = await request(app).post('/api/contact').send(messageValide);
    expect(reponse.status).toBe(201);
    expect(reponse.body).toEqual({ ok: true });

    const messages = await lireMessages(fichierMessages);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ ...messageValide, traite: false });
    expect(messages[0].id).toBeDefined();
    expect(messages[0].recuLe).toBeDefined();
  });

  test('refuse un message invalide avec les erreurs de chaque champ', async () => {
    const reponse = await request(app).post('/api/contact').send({ nom: '', email: 'faux', message: 'court' });
    expect(reponse.status).toBe(400);
    expect(Object.keys(reponse.body.erreurs).sort()).toEqual(['email', 'message', 'nom']);
    expect(await lireMessages(fichierMessages)).toHaveLength(0);
  });

  test('ignore les robots qui remplissent le champ piège', async () => {
    const reponse = await request(app).post('/api/contact').send({ ...messageValide, site_web: 'http://spam.example' });
    expect(reponse.status).toBe(201);
    expect(await lireMessages(fichierMessages)).toHaveLength(0);
  });

  test('ne garde que les champs attendus', async () => {
    await request(app).post('/api/contact').send({ ...messageValide, admin: true }).expect(201);
    const [message] = await lireMessages(fichierMessages);
    expect(message.admin).toBeUndefined();
  });

  test('enregistre correctement plusieurs messages envoyés en même temps', async () => {
    await Promise.all(
      [1, 2, 3, 4, 5].map((n) =>
        request(app).post('/api/contact').send({ ...messageValide, nom: `Personne ${n}` })
      )
    );
    expect(await lireMessages(fichierMessages)).toHaveLength(5);
  });

  test('limite le nombre de messages par visiteur', async () => {
    const appLimitee = creerApp({ fichierMessages, limiteMessages: 2 });
    await request(appLimitee).post('/api/contact').send(messageValide).expect(201);
    await request(appLimitee).post('/api/contact').send(messageValide).expect(201);
    const reponse = await request(appLimitee).post('/api/contact').send(messageValide);
    expect(reponse.status).toBe(429);
    expect(reponse.body.erreur).toMatch(/Réessayez/);
  });
});

describe('POST /contact (formulaire sans JavaScript)', () => {
  test('redirige vers la confirmation après un envoi valide', async () => {
    const reponse = await request(app).post('/contact').type('form').send(messageValide);
    expect(reponse.status).toBe(303);
    expect(reponse.headers.location).toBe('/contact?envoye=1#formulaire');
    expect(await lireMessages(fichierMessages)).toHaveLength(1);
  });

  test('réaffiche le formulaire avec les erreurs et les valeurs saisies', async () => {
    const reponse = await request(app)
      .post('/contact')
      .type('form')
      .send({ nom: 'Marie', email: 'pas-une-adresse', message: messageValide.message });
    expect(reponse.status).toBe(400);
    expect(reponse.text).toContain('Vérifiez votre adresse courriel');
    expect(reponse.text).toContain('value="Marie"');
  });

  test('la page de confirmation affiche le message de remerciement', async () => {
    const { text } = await request(app).get('/contact?envoye=1');
    expect(text).toMatch(/<div class="confirmation" id="confirmation" tabindex="-1"\s*>/);
    expect(text).toContain('Merci pour votre message');
  });

  test('le texte saisi est échappé (pas d’injection de code dans la page)', async () => {
    const reponse = await request(app)
      .post('/contact')
      .type('form')
      .send({ nom: '<script>alert(1)</script>', email: 'faux', message: 'court' });
    expect(reponse.text).not.toContain('<script>alert(1)</script>');
    expect(reponse.text).toContain('&lt;script&gt;');
  });
});
