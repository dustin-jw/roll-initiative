const { test, expect } = require('@playwright/test');
const { characters } = require('../seed-data/characters');

test('returns the requested character', async ({ request }) => {
  const response = await request.get(`/character/${characters[0].id}`);
  const character = await response.json();

  expect(response.ok()).toBeTruthy();
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
  const character = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(character).toEqual(
    expect.objectContaining({
      id: characters[1].id,
      name: characters[1].name,
      hitPoints: characters[1].hitPoints,
    })
  );
});
