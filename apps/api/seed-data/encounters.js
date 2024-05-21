const { users } = require('./users');
const { characters } = require('./characters');

module.exports = {
  encounters: [
    {
      id: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
      userId: users[0].id,
      name: 'Skeleton Factory',
    },
    {
      id: 'c7a0d0e4-9f41-416a-9f2a-15b4b2bf0d8b',
      userId: users[0].id,
      name: 'Summoning Ritual',
    },
  ],
  encounterCharacters: [
    {
      id: '789c9570-f2e6-4bf1-a0bc-15fb359b5876',
      userId: users[0].id,
      encounterId: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
      name: characters[0].name,
      initiative: 11,
      hitPoints: 142,
    },
    {
      id: 'ccc417f6-1a62-484a-bd04-77cee7677760',
      userId: users[0].id,
      encounterId: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
      name: characters[1].name,
      initiative: 18,
      hitPoints: 153,
    },
  ],
};
