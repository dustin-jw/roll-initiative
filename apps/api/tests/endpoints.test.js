const { test, expect } = require('@playwright/test');
const { users } = require('../seed-data/users');
const { characters } = require('../seed-data/characters');

let testCharacterId;
test.describe('characters', () => {
  test.describe('happy path', () => {
    test('returns the requested character', async ({ request }) => {
      const response = await request.get(`/character/${characters[0].id}`);
      expect(response.ok()).toBeTruthy();

      const character = await response.json();
      expect(character).toEqual(
        expect.objectContaining({
          id: characters[0].id,
          name: characters[0].name,
          hitPoints: characters[0].hitPoints,
        })
      );
    });

    test('returns a different character', async ({ request }) => {
      const response = await request.get(`/character/${characters[1].id}`);
      expect(response.ok()).toBeTruthy();

      const character = await response.json();
      expect(character).toEqual(
        expect.objectContaining({
          id: characters[1].id,
          name: characters[1].name,
          hitPoints: characters[1].hitPoints,
        })
      );
    });

    test('gets all characters that are owned by a given user', async ({ request }) => {
      const response = await request.get(`/characters/${users[0].id}`);
      expect(response.ok()).toBeTruthy();

      const fetchedCharacters = await response.json();
      expect(fetchedCharacters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: characters[0].id,
            name: characters[0].name,
            hitPoints: characters[0].hitPoints,
          }),
          expect.objectContaining({
            id: characters[1].id,
            name: characters[1].name,
            hitPoints: characters[1].hitPoints,
          }),
        ])
      );
    });

    test('creates a new character', async ({ request }) => {
      const newCharacter = {
        userId: users[0].id,
        name: 'Goose',
        hitPoints: 95,
      };
      const response = await request.post('/character', {
        data: newCharacter,
      });
      expect(response.ok()).toBeTruthy();

      const createdCharacter = await response.json();
      testCharacterId = createdCharacter.id;
      expect(createdCharacter).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
          name: newCharacter.name,
          hitPoints: newCharacter.hitPoints,
        })
      );
    });

    test('updates a character', async ({ request }) => {
      const characterToUpdate = {
        id: testCharacterId,
        name: 'JP Riddles',
        hitPoints: 135,
      };
      const response = await request.patch('/character', {
        data: characterToUpdate,
      });
      expect(response.ok()).toBeTruthy();

      const updatedCharacter = await response.json();
      expect(updatedCharacter).toEqual(
        expect.objectContaining({
          id: characterToUpdate.id,
          name: characterToUpdate.name,
          hitPoints: characterToUpdate.hitPoints,
        })
      );
    });
  });
});
