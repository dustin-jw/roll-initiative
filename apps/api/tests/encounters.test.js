const { test, expect } = require('@playwright/test');
const { users } = require('../seed-data/users');
const { characters } = require('../seed-data/characters');
const { encounters, encounterCharacters } = require('../seed-data/encounters');

let testEncounterId;
let testEncounterCharacterId;
const testEncounterName = 'Big Bad Evil Guy';
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
        name: testEncounterName,
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
          name: testEncounterName,
        })
      );
    });

    test('updates an encounter', async ({ request }) => {
      const newName = 'Just a bunch of rats';
      const response = await request.patch('/encounter', {
        data: {
          id: encounters[0].id,
          name: newName,
        },
      });
      expect(response.ok()).toBeTruthy();

      const encounterData = await response.json();
      expect(encounterData.length).toEqual(2);
      expect(encounterData).toEqual([
        expect.objectContaining({ encounterName: newName }),
        expect.objectContaining({ encounterName: newName }),
      ]);

      const getEncountersResponse = await request.get(`/encounters/${users[0].id}`);
      expect(getEncountersResponse.ok()).toBeTruthy();

      const allEncounters = await getEncountersResponse.json();
      expect(allEncounters.length).toEqual(3);
      expect(allEncounters).toContainEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
          name: newName,
        })
      );
    });

    test('adds a character to an encounter', async ({ request }) => {
      const newCharacter = {
        userId: users[0].id,
        encounterId: testEncounterId,
        name: 'Grover',
        hitPoints: 123,
        initiative: 12,
      };
      const response = await request.post('/encounter-character', {
        data: newCharacter,
      });
      expect(response.ok()).toBeTruthy();

      const encounterCharacter = await response.json();
      testEncounterCharacterId = encounterCharacter.id;
      expect(encounterCharacter).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
          name: newCharacter.name,
          hitPoints: newCharacter.hitPoints,
          initiative: newCharacter.initiative,
        })
      );

      const encounterResponse = await request.get(`/encounter/${testEncounterId}`);
      expect(encounterResponse.ok()).toBeTruthy();

      const encounter = await encounterResponse.json();
      expect(encounter.length).toEqual(1);
      expect(encounter).toEqual([
        expect.objectContaining({
          encounterId: testEncounterId,
          characterId: testEncounterCharacterId,
          encounterName: testEncounterName,
          characterName: newCharacter.name,
          hitPoints: newCharacter.hitPoints,
          initiative: newCharacter.initiative,
        }),
      ]);
    });

    test('updates a character in an encounter', async ({ request }) => {
      const updatedCharacterData = {
        id: testEncounterCharacterId,
        name: 'Bartholemew',
        hitPoints: 96,
        initiative: 12,
      };
      const response = await request.patch('/encounter-character', {
        data: updatedCharacterData,
      });
      expect(response.ok()).toBeTruthy();

      const updatedCharacter = await response.json();
      expect(updatedCharacter).toEqual(
        expect.objectContaining({
          id: updatedCharacterData.id,
          name: updatedCharacterData.name,
          hitPoints: updatedCharacterData.hitPoints,
          initiative: updatedCharacterData.initiative,
        })
      );

      const encounterResponse = await request.get(`/encounter/${testEncounterId}`);
      expect(encounterResponse.ok()).toBeTruthy();

      const encounter = await encounterResponse.json();
      expect(encounter.length).toEqual(1);
      expect(encounter).toEqual([
        expect.objectContaining({
          encounterId: testEncounterId,
          characterId: testEncounterCharacterId,
          encounterName: testEncounterName,
          characterName: updatedCharacterData.name,
          hitPoints: updatedCharacterData.hitPoints,
          initiative: updatedCharacterData.initiative,
        }),
      ]);
    });

    test('removes a character from an encounter', async ({ request }) => {
      const response = await request.delete(`/encounter-character/${testEncounterCharacterId}`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toEqual(204);

      const encounterResponse = await request.get(`/encounter/${testEncounterId}`);
      expect(encounterResponse.ok()).toBeTruthy();

      const encounter = await encounterResponse.json();
      expect(encounter.length).toEqual(0);
    });

    test('deletes an encounter', async ({ request }) => {
      const response = await request.delete(`/encounter/${testEncounterId}`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toEqual(204);

      const getEncountersResponse = await request.get(`/encounters/${users[0].id}`);
      expect(getEncountersResponse.ok()).toBeTruthy();

      const allEncounters = await getEncountersResponse.json();
      expect(allEncounters.length).toEqual(2);
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
