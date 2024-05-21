const { test, expect } = require('@playwright/test');
const { users } = require('../seed-data/users');
const { characters } = require('../seed-data/characters');
const { encounters, encounterCharacters } = require('../seed-data/encounters');

let testCharacterId;
let testEncounterId;
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
      expect(fetchedCharacters.length).toEqual(2);
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

    test('returns an empty array when a user has no characters', async ({ request }) => {
      const response = await request.get(`/characters/${users[1].id}`);
      expect(response.ok()).toBeTruthy();

      const allCharacters = await response.json();
      expect(allCharacters.length).toEqual(0);
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

      const getCharactersResponse = await request.get(`/characters/${users[0].id}`);
      expect(getCharactersResponse.ok()).toBeTruthy();

      const allCharacters = await getCharactersResponse.json();
      expect(allCharacters.length).toEqual(3);
      expect(allCharacters).toContainEqual(
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

    test('deletes a character', async ({ request }) => {
      const response = await request.delete(`/character/${testCharacterId}`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toEqual(204);

      const getCharactersResponse = await request.get(`/characters/${users[0].id}`);
      expect(getCharactersResponse.ok()).toBeTruthy();

      const allCharacters = await getCharactersResponse.json();
      expect(allCharacters.length).toEqual(2);
    });
  });

  test.describe('unhappy path', () => {
    test('returns a 404 when character is not found', async ({ request }) => {
      const response = await request.get('/character/invalid-id');
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toEqual(404);
    });

    test('returns an empty array when a user does not exist', async ({ request }) => {
      const response = await request.get('/characters/invalid-id');
      expect(response.ok()).toBeTruthy();

      const allCharacters = await response.json();
      expect(allCharacters.length).toEqual(0);
    });

    test('returns a bad request status when incomplete character info is given', async ({ request }) => {
      const missingUserIdCharacter = {
        name: 'Goose',
        hitPoints: 95,
      };
      const missingUserIdResponse = await request.post('/character', {
        data: missingUserIdCharacter,
      });
      expect(missingUserIdResponse.ok()).toBeFalsy();
      expect(missingUserIdResponse.status()).toEqual(400);

      const missingNameCharacter = {
        userId: users[0].id,
        hitPoints: 95,
      };
      const missingNameResponse = await request.post('/character', {
        data: missingNameCharacter,
      });
      expect(missingNameResponse.ok()).toBeFalsy();
      expect(missingNameResponse.status()).toEqual(400);
    });
  });
});

test.describe('encounters', () => {
  test.describe('happy path', () => {
    test("returns the requested encounter's details", async ({ request }) => {
      const response = await request.get(`/encounter/${encounters[0].id}`);
      expect(response.ok()).toBeTruthy();

      const encounter = await response.json();
      expect(encounter.length).toEqual(2);
      expect(encounter).toEqual([
        expect.objectContaining({
          encounterId: encounters[0].id,
          characterId: encounterCharacters[1].id,
          encounterName: encounters[0].name,
          characterName: characters[1].name,
          hitPoints: encounterCharacters[1].hitPoints,
          initiative: encounterCharacters[1].initiative,
        }),
        expect.objectContaining({
          encounterId: encounters[0].id,
          characterId: encounterCharacters[0].id,
          encounterName: encounters[0].name,
          characterName: characters[0].name,
          hitPoints: encounterCharacters[0].hitPoints,
          initiative: encounterCharacters[0].initiative,
        }),
      ]);
    });

    test("returns the user's encounters", async ({ request }) => {
      const response = await request.get(`/encounters/${users[0].id}`);
      expect(response.ok()).toBeTruthy();

      const userEncounters = await response.json();
      expect(userEncounters.length).toEqual(2);
      expect(userEncounters).toEqual([
        expect.objectContaining({
          id: encounters[0].id,
          name: encounters[0].name,
        }),
        expect.objectContaining({
          id: encounters[1].id,
          name: encounters[1].name,
        }),
      ]);
    });

    test('creates a new encounter', async ({ request }) => {
      const newEncounter = {
        userId: users[0].id,
        name: 'Big Bad Evil Guy',
      };
      const response = await request.post('/encounter', {
        data: newEncounter,
      });
      expect(response.ok()).toBeTruthy();

      const createdEncounter = await response.json();
      testEncounterId = createdEncounter.id;
      expect(createdEncounter.id).toEqual(
        expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      );

      const freshEncounterResponse = await request.get(`/encounter/${testEncounterId}`);
      expect(freshEncounterResponse.ok()).toBeTruthy();

      const freshEncounter = await freshEncounterResponse.json();
      expect(freshEncounter.length).toEqual(0);

      const getEncountersResponse = await request.get(`/encounters/${users[0].id}`);
      expect(getEncountersResponse.ok()).toBeTruthy();

      const allEncounters = await getEncountersResponse.json();
      expect(allEncounters.length).toEqual(3);
      expect(allEncounters).toContainEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
          name: 'Big Bad Evil Guy',
        })
      );
    });
  });

  test.describe('unhappy path', () => {
    test('returns a 404 when an encounter does not exist', async ({ request }) => {
      const response = await request.get(`/encounter/invalid-id`);
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toEqual(404);
    });

    test('returns an empty array when a user does not exist', async ({ request }) => {
      const response = await request.get(`/encounters/invalid-id`);
      expect(response.ok()).toBeTruthy();
      const userEncounters = await response.json();
      expect(userEncounters.length).toEqual(0);
    });

    test('returns a bad request status when incomplete encounter info is given', async ({ request }) => {
      const missingUserIdResponse = await request.post(`/encounter`, {
        data: {
          name: 'Failed prison break',
        },
      });
      expect(missingUserIdResponse.ok()).toBeFalsy();
      expect(missingUserIdResponse.status()).toEqual(400);

      const missingNameResponse = await request.post(`/encounter`, {
        data: {
          userId: users[0].id,
        },
      });
      expect(missingNameResponse.ok()).toBeFalsy();
      expect(missingNameResponse.status()).toEqual(400);
    });
  });
});
