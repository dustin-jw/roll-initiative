'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  db.serialize(() => {
    db.run(`CREATE TABLE users (
      id TEXT PRIMARY KEY
    );`);

    db.run('INSERT INTO users VALUES ($id);', { $id: 'c99a288a-dfd8-4c95-a002-f0b03f102978' });

    db.run(`CREATE TABLE characters (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      hitPoints INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id)
    );`);

    db.run('INSERT INTO characters VALUES ($id, $userId, $name, $hitPoints);', {
      $id: 'fb6255a0-583a-4978-8983-f6c8d4ceae98',
      $userId: 'c99a288a-dfd8-4c95-a002-f0b03f102978',
      $name: 'Barry',
      $hitPoints: 142,
    });

    db.run('INSERT INTO characters VALUES ($id, $userId, $name, $hitPoints);', {
      $id: 'fd40198d-a9e5-4a3b-8018-324b34d59384',
      $userId: 'c99a288a-dfd8-4c95-a002-f0b03f102978',
      $name: 'Sena',
      $hitPoints: 153,
    });

    db.run(`CREATE TABLE encounters (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );`);

    db.run('INSERT INTO encounters VALUES ($id, $userId, $name);', {
      $id: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
      $userId: 'c99a288a-dfd8-4c95-a002-f0b03f102978',
      $name: 'Skeleton Factory',
    });

    db.run(`CREATE TABLE encounter_characters (
      id TEXT PRIMARY KEY,
      userId TEXT,
      encounterId TEXT,
      characterId TEXT,
      initiative INTEGER,
      hitPoints INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(encounterId) REFERENCES encounters(id),
      FOREIGN KEY(characterId) REFERENCES characters(id)
    );`);

    db.run(
      'INSERT INTO encounter_characters VALUES ($id, $userId, $encounterId, $characterId, $initiative, $hitPoints);',
      {
        $id: '789c9570-f2e6-4bf1-a0bc-15fb359b5876',
        $userId: 'c99a288a-dfd8-4c95-a002-f0b03f102978',
        $encounterId: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
        $characterId: 'fb6255a0-583a-4978-8983-f6c8d4ceae98',
        $initiative: 11,
        $hitPoints: 142,
      }
    );

    db.run(
      'INSERT INTO encounter_characters VALUES ($id, $userId, $encounterId, $characterId, $initiative, $hitPoints);',
      {
        $id: 'ccc417f6-1a62-484a-bd04-77cee7677760',
        $userId: 'c99a288a-dfd8-4c95-a002-f0b03f102978',
        $encounterId: 'e563e2d1-ea32-47df-9fc7-74eb2152e730',
        $characterId: 'fd40198d-a9e5-4a3b-8018-324b34d59384',
        $initiative: 18,
        $hitPoints: 153,
      }
    );
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({ db }, opts),
  });
};

module.exports.options = options
