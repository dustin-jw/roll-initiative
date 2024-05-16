'use strict';

const { test } = require('tap');
const { build } = require('../helper');

const { characters } = require('../../seed-data/characters');

test('example is loaded', async (t) => {
  const app = await build(t);

  const expected = {
    id: characters[0].id,
    name: characters[0].name,
    hitPoints: characters[0].hitPoints,
  };

  const res = await app.inject({
    url: `/character/${characters[0].id}`,
  });
  t.equal(res.payload, JSON.stringify(expected));
});
