const { test, expect } = require('@playwright/test');
const { users } = require('../seed-data/users');
const { characters } = require('../seed-data/characters');

test.describe('characters', () => {
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
});
