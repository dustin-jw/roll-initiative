const { test, expect } = require('@playwright/test');

test.describe('generate-id', () => {
  test('returns a random UUID', async ({ request }) => {
    const response = await request.get('/generate-id');
    expect(response.ok()).toBeTruthy();

    const { id } = await response.json();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
